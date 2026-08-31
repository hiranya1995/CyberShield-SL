// Common logic for CyberShield SL

document.addEventListener('DOMContentLoaded', () => {
    // 1. Sidebar Navigation Logic
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const sections = document.querySelectorAll('.content-section');

    sidebarItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('data-target');
            
            if (targetId) {
                // Update active state on sidebar
                sidebarItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');

                // Update visible section
                sections.forEach(sec => sec.classList.remove('active'));
                document.getElementById(targetId).classList.add('active');

                // Update Progress Bar
                const globalProgress = document.getElementById('globalProgress');
                const progressText = document.querySelector('.progress-pill span');
                
                let percent = 0;
                if (targetId === 'section1') percent = 25;
                else if (targetId === 'section2') percent = 50;
                else if (targetId === 'section3') percent = 75;
                else if (targetId === 'section4') percent = 90;

                if (globalProgress && progressText) {
                    const currentWidth = parseInt(globalProgress.style.width) || 0;
                    if (percent > currentWidth && currentWidth < 100) {
                        globalProgress.style.width = percent + '%';
                        progressText.innerText = 'Progress: ' + percent + '%';
                    }
                }
            }
        });
    });

    // 2. Simulated Video Player Logic
    const playBtn = document.querySelector('.play-button');
    const videoProgress = document.querySelector('.video-progress-fill');
    const videoTime = document.querySelector('.video-time');
    const chapterCards = document.querySelectorAll('.chapter-card');

    let isPlaying = false;
    let progress = 0;
    let videoInterval;

    if (playBtn) {
        playBtn.addEventListener('click', () => {
            isPlaying = !isPlaying;
            if (isPlaying) {
                playBtn.innerHTML = '<i class="ti ti-player-pause-filled"></i>';
                videoInterval = setInterval(() => {
                    progress += 1;
                    if (progress > 100) progress = 0;
                    videoProgress.style.width = progress + '%';
                    
                    // Simulate time (assuming 10 min video = 600s, 1% = 6s)
                    const totalSeconds = Math.floor((progress / 100) * 600);
                    const mins = Math.floor(totalSeconds / 60);
                    const secs = totalSeconds % 60;
                    videoTime.textContent = `${mins}:${secs.toString().padStart(2, '0')} / 10:00`;

                    // Highlight chapters based on progress
                    chapterCards.forEach((card, index) => {
                        const chapterStart = index * 25; // simple 4 equal parts
                        if (progress >= chapterStart && progress < chapterStart + 25) {
                            chapterCards.forEach(c => c.classList.remove('active'));
                            card.classList.add('active');
                        }
                    });
                }, 500); // Fast simulation for demo
            } else {
                playBtn.innerHTML = '<i class="ti ti-player-play-filled"></i>';
                clearInterval(videoInterval);
            }
        });
    }

    // Interactive exercises will be handled within their respective HTML files
    // due to unique logic per module, but we can set up global utility functions here.
});

// Utility to get current user
function getCurrentUser() {
    return localStorage.getItem('cyberShieldCurrentUser');
}

// Utility to get all users
function getAllUsers() {
    return JSON.parse(localStorage.getItem('cyberShieldUsers')) || [];
}

// Utility to save progress
function saveModuleProgress(moduleNum, score, passed) {
    const currentUserId = getCurrentUser();
    if (!currentUserId || currentUserId === 'admin') return;

    let users = getAllUsers();
    let userIndex = users.findIndex(u => u.empId === currentUserId);
    
    if (userIndex !== -1) {
        if (!users[userIndex].progress) {
            users[userIndex].progress = {};
        }
        users[userIndex].progress[`module${moduleNum}`] = {
            score: score,
            passed: passed,
            completedAt: new Date().toISOString()
        };
        localStorage.setItem('cyberShieldUsers', JSON.stringify(users));
    }

    // Trigger Sentry mascot reaction
    if (typeof CyberSentry !== 'undefined') {
        setTimeout(() => {
            if (passed) {
                CyberSentry.celebrate();
            } else {
                CyberSentry.showFailTip();
            }
        }, 500);
    }
}


// Utility to get progress
function getModuleProgress() {
    const currentUserId = getCurrentUser();
    if (!currentUserId || currentUserId === 'admin') return {};

    let users = getAllUsers();
    let user = users.find(u => u.empId === currentUserId);
    
    return (user && user.progress) ? user.progress : {};
}
