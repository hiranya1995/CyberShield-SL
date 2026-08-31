"""
server.py — Mock SIEM Telemetry Pipeline  (Level 3 — Real-time Dashboard)
==========================================================================
Adds:
  • In-memory ring-buffer for last 500 events  (collections.deque)
  • Server-Sent Events stream  GET /api/stream
  • Pre-computed stats endpoint  GET /api/stats
  • Root route  GET /  → serves dashboard.html
  • Thread-safe SSE client registry

Author  : Backend Security Engineer
Version : 2.0.0
"""

import json
import logging
import queue
import sys
import threading
import uuid
from collections import deque, defaultdict
from datetime import datetime, timezone, timedelta
from functools import wraps

from flask import Flask, Response, request, jsonify, send_from_directory
from flask_cors import CORS

# ──────────────────────────────────────────────────────────────────────────────
# CONFIGURATION
# ──────────────────────────────────────────────────────────────────────────────

LOG_FILE        = "siem_security_events.log"
API_KEY_HEADER  = "X-API-Key"
VALID_API_KEY   = "siem-dev-secret-2026"   # Replace with env-var in production
EVENT_BUFFER    = 500                       # Max events kept in memory
TIMELINE_MINS   = 10                        # Rolling window for events/min chart

SEVERITY_COLORS = {
    "CRITICAL": "\033[1;31m",
    "HIGH"    : "\033[0;31m",
    "MEDIUM"  : "\033[0;33m",
    "LOW"     : "\033[0;32m",
    "INFO"    : "\033[0;36m",
}
RESET = "\033[0m"

# ──────────────────────────────────────────────────────────────────────────────
# IN-MEMORY STATE
# ──────────────────────────────────────────────────────────────────────────────

event_store: deque = deque(maxlen=EVENT_BUFFER)   # ring buffer of enriched events
sse_clients: list  = []                            # list of queue.Queue, one per SSE client
state_lock         = threading.Lock()             # protects both event_store and sse_clients

# ──────────────────────────────────────────────────────────────────────────────
# LOGGING SETUP
# ──────────────────────────────────────────────────────────────────────────────

class JsonFormatter(logging.Formatter):
    def format(self, record):
        timestamp = datetime.fromtimestamp(record.created, tz=timezone.utc).isoformat()
        return f"{timestamp} - {record.levelname} - {record.getMessage()}"


def configure_logger():
    # Force UTF-8 on Windows console so unicode chars render correctly
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    logger = logging.getLogger("siem")
    logger.setLevel(logging.DEBUG)

    fh = logging.FileHandler(LOG_FILE, encoding="utf-8")
    fh.setLevel(logging.INFO)
    fh.setFormatter(JsonFormatter())

    sh = logging.StreamHandler(sys.stdout)
    sh.setLevel(logging.DEBUG)
    sh.setFormatter(logging.Formatter("%(asctime)s [%(levelname)s] %(message)s",
                                      datefmt="%Y-%m-%d %H:%M:%S"))
    logger.addHandler(fh)
    logger.addHandler(sh)
    return logger


logger = configure_logger()

# ──────────────────────────────────────────────────────────────────────────────
# FLASK APPLICATION
# ──────────────────────────────────────────────────────────────────────────────

app = Flask(__name__, static_folder=".", static_url_path="")
CORS(app, resources={r"/api/*": {"origins": "*"}})

# ──────────────────────────────────────────────────────────────────────────────
# MIDDLEWARE
# ──────────────────────────────────────────────────────────────────────────────

def require_api_key(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        key = request.headers.get(API_KEY_HEADER)
        if key != VALID_API_KEY:
            logger.warning("Rejected — bad API key from %s", request.remote_addr)
            return jsonify({"status": "error", "message": "Unauthorized.", "code": 401}), 401
        return f(*args, **kwargs)
    return decorated

# ──────────────────────────────────────────────────────────────────────────────
# HELPERS
# ──────────────────────────────────────────────────────────────────────────────

REQUIRED_FIELDS    = {"source", "event_type", "severity"}
ALLOWED_SEVERITIES = {"CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"}


def validate_payload(data):
    missing = REQUIRED_FIELDS - data.keys()
    if missing:
        return False, f"Missing required fields: {', '.join(sorted(missing))}"
    sev = str(data.get("severity", "")).upper()
    if sev not in ALLOWED_SEVERITIES:
        return False, f"Invalid severity '{sev}'. Allowed: {', '.join(sorted(ALLOWED_SEVERITIES))}"
    return True, ""


def enrich_event(data):
    return {
        "event_id"   : str(uuid.uuid4()),
        "ingested_at": datetime.now(timezone.utc).isoformat(),
        "source_ip"  : request.remote_addr,
        "user_agent" : request.headers.get("User-Agent", "unknown"),
        **data,
        "severity"   : data["severity"].upper(),
    }


def print_siem_alert(event):
    sev   = event.get("severity", "INFO")
    color = SEVERITY_COLORS.get(sev, "")
    border = "=" * 62
    print(f"\n{color}+{border}+")
    print(f"|  🚨 [SIEM ALERT]   Severity: {sev:<10}                      |")
    print(f"+{border}+")
    print(f"|  Event ID   : {event.get('event_id', 'N/A')}")
    print(f"|  Source     : {event.get('source', 'N/A')}")
    print(f"|  Event Type : {event.get('event_type', 'N/A')}")
    print(f"|  Source IP  : {event.get('source_ip', 'N/A')}")
    print(f"|  Ingested   : {event.get('ingested_at', 'N/A')}")
    if "message" in event:
        print(f"|  Message    : {event['message']}")
    print(f"+{border}+{RESET}\n")


def broadcast_sse(event):
    """Push a JSON event to every connected SSE client queue."""
    payload = json.dumps(event, ensure_ascii=False)
    dead = []
    with state_lock:
        for q in sse_clients:
            try:
                q.put_nowait(payload)
            except queue.Full:
                dead.append(q)
        for q in dead:
            sse_clients.remove(q)


def compute_stats():
    """Compute dashboard stats from the in-memory event store."""
    now = datetime.now(timezone.utc)
    severity_counts = defaultdict(int)
    ip_counts       = defaultdict(int)
    # Build timeline buckets: one entry per minute for last TIMELINE_MINS minutes
    timeline = {}
    for i in range(TIMELINE_MINS):
        bucket = (now - timedelta(minutes=TIMELINE_MINS - 1 - i)).strftime("%H:%M")
        timeline[bucket] = 0

    with state_lock:
        events_snapshot = list(event_store)

    for ev in events_snapshot:
        sev = ev.get("severity", "INFO")
        severity_counts[sev] += 1
        ip = ev.get("source_ip", "unknown")
        ip_counts[ip] += 1
        try:
            ts = datetime.fromisoformat(ev["ingested_at"])
            bucket = ts.strftime("%H:%M")
            if bucket in timeline:
                timeline[bucket] += 1
        except (KeyError, ValueError):
            pass

    top_ips = sorted(ip_counts.items(), key=lambda x: x[1], reverse=True)[:5]

    return {
        "total_events"    : len(events_snapshot),
        "severity_counts" : dict(severity_counts),
        "timeline"        : timeline,
        "top_ips"         : [{"ip": ip, "count": cnt} for ip, cnt in top_ips],
        "events_per_min"  : round(len(events_snapshot) / max(TIMELINE_MINS, 1), 2),
        "active_sources"  : len({ev.get("source") for ev in events_snapshot if ev.get("source")}),
    }

# ──────────────────────────────────────────────────────────────────────────────
# ROUTES
# ──────────────────────────────────────────────────────────────────────────────

@app.route("/")
def serve_dashboard():
    """Serve the real-time dashboard."""
    return send_from_directory(".", "dashboard.html")


@app.route("/api/telemetry", methods=["POST"])
@require_api_key
def ingest_telemetry():
    """
    POST /api/telemetry
    Validates → enriches → stores in-memory → logs to file → broadcasts SSE.
    """
    if not request.is_json:
        return jsonify({"status": "error", "message": "Content-Type must be application/json.", "code": 415}), 415

    try:
        raw_data = request.get_json(force=False, silent=False)
    except Exception:
        logger.error("Malformed JSON from %s", request.remote_addr)
        return jsonify({"status": "error", "message": "Malformed JSON payload.", "code": 400}), 400

    if not isinstance(raw_data, dict):
        return jsonify({"status": "error", "message": "Payload must be a JSON object.", "code": 400}), 400

    is_valid, error_msg = validate_payload(raw_data)
    if not is_valid:
        return jsonify({"status": "error", "message": error_msg, "code": 422}), 422

    event = enrich_event(raw_data)

    # Store in ring buffer
    with state_lock:
        event_store.append(event)

    # Console alert
    print_siem_alert(event)

    # Persist to log file
    log_level = (
        logging.CRITICAL if event["severity"] == "CRITICAL" else
        logging.ERROR    if event["severity"] == "HIGH"     else
        logging.WARNING  if event["severity"] == "MEDIUM"   else
        logging.INFO
    )
    logger.log(log_level, json.dumps(event, ensure_ascii=False))

    # Push to all SSE clients
    broadcast_sse(event)

    return jsonify({
        "status"  : "ok",
        "message" : "Telemetry event ingested successfully.",
        "event_id": event["event_id"],
        "code"    : 200
    }), 200


@app.route("/api/stream")
def sse_stream():
    """
    GET /api/stream
    Server-Sent Events endpoint — each connected browser tab gets a
    dedicated Queue. New events are pushed within milliseconds of ingestion.
    No authentication on purpose: SSE is read-only and carries no secrets.
    """
    client_queue = queue.Queue(maxsize=100)

    with state_lock:
        sse_clients.append(client_queue)

    logger.debug("SSE client connected. Total clients: %d", len(sse_clients))

    def event_generator():
        # Send a heartbeat comment every 15 s to keep the connection alive
        # and an initial "connected" event so the browser knows it's live.
        try:
            yield ": connected\n\n"
            while True:
                try:
                    payload = client_queue.get(timeout=15)
                    yield f"data: {payload}\n\n"
                except queue.Empty:
                    yield ": heartbeat\n\n"   # SSE comment — keeps connection alive
        except GeneratorExit:
            pass
        finally:
            with state_lock:
                try:
                    sse_clients.remove(client_queue)
                except ValueError:
                    pass
            logger.debug("SSE client disconnected. Total clients: %d", len(sse_clients))

    return Response(
        event_generator(),
        mimetype="text/event-stream",
        headers={
            "Cache-Control"      : "no-cache",
            "X-Accel-Buffering"  : "no",     # Disable Nginx proxy buffering
            "Connection"         : "keep-alive",
        }
    )


@app.route("/api/stats")
@require_api_key
def get_stats():
    """GET /api/stats — Pre-computed dashboard metrics from the event ring-buffer."""
    return jsonify({"status": "ok", **compute_stats()}), 200


@app.route("/api/events")
@require_api_key
def list_recent_events():
    """GET /api/events?limit=50 — Returns last N events from the ring-buffer."""
    limit = max(1, min(request.args.get("limit", 50, type=int), 500))
    with state_lock:
        snapshot = list(event_store)[-limit:]
    return jsonify({"status": "ok", "total": len(snapshot), "events": snapshot}), 200


@app.route("/api/health")
def health_check():
    return jsonify({
        "status"        : "healthy",
        "timestamp"     : datetime.now(timezone.utc).isoformat(),
        "service"       : "mock-siem-telemetry-pipeline",
        "version"       : "2.0.0",
        "sse_clients"   : len(sse_clients),
        "events_buffered": len(event_store),
    }), 200

# ──────────────────────────────────────────────────────────────────────────────
# ERROR HANDLERS
# ──────────────────────────────────────────────────────────────────────────────

@app.errorhandler(404)
def not_found(e):
    return jsonify({"status": "error", "message": "Endpoint not found.", "code": 404}), 404

@app.errorhandler(405)
def method_not_allowed(e):
    return jsonify({"status": "error", "message": "Method not allowed.", "code": 405}), 405

@app.errorhandler(500)
def internal_error(e):
    logger.critical("Unhandled server error: %s", str(e))
    return jsonify({"status": "error", "message": "Internal server error.", "code": 500}), 500

# ──────────────────────────────────────────────────────────────────────────────
# ENTRYPOINT
# ──────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    logger.info("SIEM Telemetry Pipeline v2.0 - Real-time Dashboard Edition")
    logger.info("[*] Dashboard  : http://localhost:5000")
    logger.info("[*] SSE Stream : http://localhost:5000/api/stream")
    logger.info("[*] Stats API  : http://localhost:5000/api/stats")
    logger.info("[*] Log file   : %s", LOG_FILE)
    app.run(host="0.0.0.0", port=5000, debug=True, threaded=True)


