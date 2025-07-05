document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const minutesDisplay = document.getElementById('minutes');
    const secondsDisplay = document.getElementById('seconds');
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    const modeBtns = document.querySelectorAll('.mode-btn');
    const themeBtns = document.querySelectorAll('.theme-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeBtn = document.querySelector('.close-btn');
    const saveSettingsBtn = document.getElementById('save-settings');
    const alarmSound = document.getElementById('alarm-sound');
    
    // Timer variables
    let timer;
    let totalSeconds = 25 * 60; // Default pomodoro time
    let remainingSeconds = totalSeconds;
    let isRunning = false;
    let currentMode = 'pomodoro';
    
    // Timer settings
    let settings = {
        pomodoro: 25,
        shortBreak: 5,
        longBreak: 10
    };
    
    // Load settings from localStorage if available
    if (localStorage.getItem('pomodoroSettings')) {
        settings = JSON.parse(localStorage.getItem('pomodoroSettings'));
    }
    
    // Initialize timer
    updateDisplay();
    
    // Event Listeners
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);
    
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => switchMode(btn.dataset.mode));
    });
    
    themeBtns.forEach(btn => {
        btn.addEventListener('click', () => switchTheme(btn.dataset.theme));
    });
    
    settingsBtn.addEventListener('click', openSettings);
    closeBtn.addEventListener('click', closeSettings);
    saveSettingsBtn.addEventListener('click', saveSettings);
    
    // Timer functions
    function startTimer() {
        if (!isRunning) {
            isRunning = true;
            timer = setInterval(updateTimer, 1000);
            startBtn.disabled = true;
            pauseBtn.disabled = false;
        }
    }
    
    function pauseTimer() {
        clearInterval(timer);
        isRunning = false;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
    }
    
    function resetTimer() {
        pauseTimer();
        remainingSeconds = totalSeconds;
        updateDisplay();
    }
    
    function updateTimer() {
        if (remainingSeconds > 0) {
            remainingSeconds--;
            updateDisplay();
        } else {
            timerComplete();
        }
    }
    
    function updateDisplay() {
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        
        minutesDisplay.textContent = minutes.toString().padStart(2, '0');
        secondsDisplay.textContent = seconds.toString().padStart(2, '0');
    }
    
    function timerComplete() {
        pauseTimer();
        alarmSound.play();
        
        // Notify user
        if (Notification.permission === 'granted') {
            new Notification('Timer Completed!', {
                body: `Your ${currentMode} timer has finished!`,
                icon: 'assets/images/icon.png'
            });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification('Timer Completed!', {
                        body: `Your ${currentMode} timer has finished!`,
                        icon: 'assets/images/icon.png'
                    });
                }
            });
        }
        
        // Auto-switch mode if pomodoro completes
        if (currentMode === 'pomodoro') {
            // You can add logic here to count pomodoros and switch to long break after 4
            setTimeout(() => {
                switchMode('short-break');
                startTimer();
            }, 1000);
        }
    }
    
    function switchMode(mode) {
        currentMode = mode;
        
        // Update active button
        modeBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.mode === mode) {
                btn.classList.add('active');
            }
        });
        
        // Set timer based on mode
        switch (mode) {
            case 'pomodoro':
                totalSeconds = settings.pomodoro * 60;
                break;
            case 'short-break':
                totalSeconds = settings.shortBreak * 60;
                break;
            case 'long-break':
                totalSeconds = settings.longBreak * 60;
                break;
        }
        
        resetTimer();
    }
    
    function switchTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('selectedTheme', theme);
    }
    
    // Load saved theme
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
        document.body.setAttribute('data-theme', savedTheme);
    }
    
    // Settings functions
    function openSettings() {
        document.getElementById('pomodoro-time').value = settings.pomodoro;
        document.getElementById('short-break-time').value = settings.shortBreak;
        document.getElementById('long-break-time').value = settings.longBreak;
        settingsModal.style.display = 'block';
    }
    
    function closeSettings() {
        settingsModal.style.display = 'none';
    }
    
    function saveSettings() {
        settings.pomodoro = parseInt(document.getElementById('pomodoro-time').value);
        settings.shortBreak = parseInt(document.getElementById('short-break-time').value);
        settings.longBreak = parseInt(document.getElementById('long-break-time').value);
        
        localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
        
        // Update current timer if settings changed for current mode
        switch (currentMode) {
            case 'pomodoro':
                totalSeconds = settings.pomodoro * 60;
                break;
            case 'short-break':
                totalSeconds = settings.shortBreak * 60;
                break;
            case 'long-break':
                totalSeconds = settings.longBreak * 60;
                break;
        }
        
        resetTimer();
        closeSettings();
    }

    // ====================== [FUNGSI FAVICON DINAMIS] ====================== //
let faviconUpdateInterval;

function initFavicon() {
  // Buat elemen <link> favicon jika belum ada
  if (!document.getElementById('dynamic-favicon')) {
    const link = document.createElement('link');
    link.id = 'dynamic-favicon';
    link.rel = 'icon';
    link.type = 'image/svg+xml';
    document.head.appendChild(link);
  }
  updateFavicon(25, 0); // Set nilai awal
}

function updateFavicon(minutes, seconds) {
  const isBreakMode = document.querySelector('.mode-btn.active').dataset.mode !== 'pomodoro';
  const color = isBreakMode ? '#4CAF50' : '#ff6b6b';
  
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="48" fill="${color}"/>
      <text x="50" y="68" font-size="50" text-anchor="middle" fill="white" font-family="Arial, sans-serif">
        ${minutes}${seconds % 10}
      </text>
    </svg>
  `;
  
  const favicon = document.getElementById('dynamic-favicon');
  favicon.href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// ====================== [INTEGRASI DENGAN TIMER] ====================== //
function startTimer() {
  if (!isRunning) {
    isRunning = true;
    timer = setInterval(updateTimer, 1000);
    
    // Update favicon setiap detik
    faviconUpdateInterval = setInterval(() => {
      const minutes = Math.floor(remainingSeconds / 60);
      const seconds = remainingSeconds % 60;
      updateFavicon(minutes, seconds);
    }, 1000);
  }
}

function pauseTimer() {
  clearInterval(timer);
  clearInterval(faviconUpdateInterval);
  isRunning = false;
}

function resetTimer() {
  pauseTimer();
  remainingSeconds = totalSeconds;
  updateDisplay();
  
  // Reset favicon
  const initialMinutes = Math.floor(totalSeconds / 60);
  updateFavicon(initialMinutes, 0);
}

function switchMode(mode) {
  // ... kode existing Anda ...
  
  // Update favicon saat mode berubah
  const initialMinutes = Math.floor(totalSeconds / 60);
  updateFavicon(initialMinutes, 0);
}

// ====================== [INISIALISASI] ====================== //
document.addEventListener('DOMContentLoaded', () => {
  initFavicon();
  
  // Sisanya kode inisialisasi timer Anda...
});
    
    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === settingsModal) {
            closeSettings();
        }
    });
    
    // Request notification permission on page load
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
    }
});
