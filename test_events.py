import urllib.request, json, time

time.sleep(3)

API = "http://localhost:5000/api/telemetry"
KEY = "siem-dev-secret-2026"

events = [
    {"source": "firewall-01", "event_type": "BRUTE_FORCE",   "severity": "CRITICAL", "message": "10 failed SSH logins from 10.0.0.5"},
    {"source": "ids-sensor",  "event_type": "PORT_SCAN",     "severity": "HIGH",     "message": "Port scan detected on 80,443,22"},
    {"source": "waf-proxy",   "event_type": "SQL_INJECTION",  "severity": "HIGH",     "message": "SQLi attempt on /api/login"},
    {"source": "app-server",  "event_type": "AUTH_FAILURE",  "severity": "MEDIUM",   "message": "Bad token from 192.168.1.20"},
    {"source": "monitor-01",  "event_type": "SYSTEM_HEALTH", "severity": "INFO",     "message": "All systems nominal"},
]

for ev in events:
    body = json.dumps(ev).encode()
    req = urllib.request.Request(
        API, data=body,
        headers={"Content-Type": "application/json", "X-API-Key": KEY},
        method="POST"
    )
    with urllib.request.urlopen(req) as r:
        resp = json.loads(r.read())
        sev = ev["severity"]
        etype = ev["event_type"]
        eid = resp["event_id"]
        print(f"[{sev:8}] {etype:20} -> {eid}")

print("All 5 test events sent successfully!")
