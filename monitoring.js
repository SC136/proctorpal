// Import core monitoring logic
const MIN_LIMIT = 3;
const MAX_LIMIT = 10;
const TIME_WINDOW = 10000;
const LAG_THRESHOLD = 500;
const RAPID_KEY_THRESHOLD = 100;
const MOUSE_CLICK_THRESHOLD = 5;
const FOCUS_CHANGE_THRESHOLD = 3;

let examStartTime;
let mouseMovements = [];
let keyStrokes = [];
let tabSwitches = 0;
let trustScore = 100;
let copyPasteCount = 0;

// Reference monitoring functions from script.js
startLine: 513
endLine: 620

// Add exam monitoring initialization
document.addEventListener('DOMContentLoaded', () => {
    const startExamBtns = document.querySelectorAll('.exam-card .button');
    startExamBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            try {
                await setupCamera();
                document.getElementById('cameraCheckModal').classList.remove('hidden');
            } catch (error) {
                alert('Camera access is required for the exam');
            }
        });
    });
}); 

async function initializeCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: 640,
        height: 480,
        frameRate: { ideal: 10, max: 15 }
      },
      audio: false
    });
    
    const video = document.getElementById('webcam');
    if (video) {
      video.srcObject = stream;
      await new Promise((resolve) => {
        video.onloadedmetadata = () => {
          resolve();
        };
      });
    }
    return stream;
  } catch (error) {
    console.error('Camera initialization failed:', error);
    throw new Error('Camera access failed. Please ensure camera permissions are granted.');
  }
}

// Update the exam start handler
async function startMockExam() {
    try {
        // Show loading message
        const loadingMessage = document.createElement("div");
        loadingMessage.textContent = "Starting camera...";
        loadingMessage.style.position = "fixed";
        loadingMessage.style.top = "50%";
        loadingMessage.style.left = "50%";
        loadingMessage.style.transform = "translate(-50%, -50%)";
        loadingMessage.style.padding = "20px";
        loadingMessage.style.background = "white";
        loadingMessage.style.borderRadius = "8px";
        loadingMessage.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
        document.body.appendChild(loadingMessage);

        // Initialize camera
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: 640,
                height: 480,
                frameRate: { ideal: 10, max: 15 }
            }
        });

        // Set up camera check video
        const cameraCheckVideo = document.getElementById('cameraCheck');
        const cameraCheckModal = document.getElementById('cameraCheckModal');
        
        if (cameraCheckVideo && stream) {
            cameraCheckVideo.srcObject = stream;
            await new Promise((resolve) => {
                cameraCheckVideo.onloadedmetadata = () => resolve();
            });
            cameraCheckModal.classList.remove('hidden');
        }

        // Remove loading message
        document.body.removeChild(loadingMessage);

        // Add event listener for start exam button if not already added
        const startExamWithCameraBtn = document.getElementById('startExamWithCameraBtn');
        if (startExamWithCameraBtn) {
            startExamWithCameraBtn.onclick = async () => {
                try {
                    // Reference existing startExamWithCameraBtn click handler
                    startLine: 500
                    endLine: 552
                } catch (error) {
                    alert("Failed to start exam: " + error.message);
                }
            };
        }

    } catch (error) {
        console.error("Error starting exam:", error);
        alert("Failed to start exam: " + error.message);
    }
}

// Export the functions
window.startMockExam = startMockExam; 

// Add missing helper functions
function enableExamRestrictions() {
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('copy', (e) => e.preventDefault());
    document.addEventListener('paste', (e) => e.preventDefault());
}

function startExamTimer() {
    const examTimer = document.getElementById('examTimer');
    let timeLeft = 30 * 60; // 30 minutes
    
    const timerInterval = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        examTimer.textContent = `Time Remaining: ${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            submitExam();
        }
        timeLeft--;
    }, 1000);
}

function startScreenMonitoring() {
    // Monitor screen size changes
    window.addEventListener('resize', () => {
        if (examStartTime) {
            trustScore = Math.max(0, trustScore - 5);
        }
    });
}

function monitorExam() {
    // Basic exam monitoring
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && examStartTime) {
            trustScore = Math.max(0, trustScore - 5);
            alert('Warning: Tab switching detected!');
        }
    });
}

function resetCount() {
    copyPasteCount = 0;
    mouseClickCount = 0;
    focusChangeCount = 0;
}

async function enterFullscreen() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
        await elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
        await elem.webkitRequestFullscreen();
    }
} 