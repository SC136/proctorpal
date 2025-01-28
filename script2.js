const loginSection = document.getElementById("loginSection");
const dashboardSection = document.getElementById("dashboardSection");
const monitoringSection = document.getElementById("monitoringSection");
const aadharInput = document.getElementById("aadharInput");
const otpSection = document.getElementById("otpSection");
const otpInput = document.getElementById("otpInput");
const getOtpBtn = document.getElementById("getOtpBtn");
const resendOtpBtn = document.getElementById("resendOtpBtn");
const loginBtn = document.getElementById("loginBtn");
const startExamBtn = document.getElementById("startExamBtn");
const guideSection = document.getElementById("guideSection");
const startLoginBtn = document.getElementById("startLoginBtn");

// Existing elements
const videoElement = document.getElementById("webcam");
const canvasElement = document.getElementById("output");
const statusElement = document.getElementById("status");

// Add these variables at the top
let examStartTime;
let mouseMovements = [];
let keyStrokes = [];
let tabSwitches = 0;
let trustScore = 100;

// Add these element references
const runSystemCheckBtn = document.getElementById("runSystemCheck");
const examSection = document.getElementById("examSection");
const submitExamBtn = document.getElementById("submitExam");
const returnToDashboardBtn = document.getElementById("returnToDashboard");
const examTimer = document.getElementById("examTimer");
const trustScoreElement = document.getElementById("trustScore");
const reportSection = document.getElementById("reportSection");
const trustMetrics = document.getElementById("trustMetrics");
const examResults = document.getElementById("examResults");

// Add these configurations at the top with other variables
// Configuration from click.js
const MIN_LIMIT = 3; // Minimum allowed number of Ctrl+C/Ctrl+V actions
const MAX_LIMIT = 10; // Maximum allowed number of Ctrl+C/Ctrl+V actions
const TIME_WINDOW = 10000; // Time window in milliseconds (e.g., 10 seconds)
const LAG_THRESHOLD = 500; // Lag threshold in milliseconds (e.g., 500ms)
const RAPID_KEY_THRESHOLD = 100; // Threshold for rapid repeated keystrokes (e.g., 100ms)
const MOUSE_CLICK_THRESHOLD = 5; // Maximum allowed mouse clicks in a time window
const FOCUS_CHANGE_THRESHOLD = 3; // Maximum allowed focus changes in a time window

// Dynamic variables from click.js
let copyPasteCount = 0;
let lastKeyTime = Date.now();
let lastKey = "";
let rapidKeyCount = 0;
let mouseClickCount = 0;
let focusChangeCount = 0;
let dynamicLimit =
  Math.floor(Math.random() * (MAX_LIMIT - MIN_LIMIT + 1)) + MIN_LIMIT;

// Add new element references
const cameraCheckModal = document.getElementById("cameraCheckModal");
const cameraCheckVideo = document.getElementById("cameraCheck");
const retakeCameraBtn = document.getElementById("retakeCameraBtn");
const startExamWithCameraBtn = document.getElementById(
  "startExamWithCameraBtn"
);

// Mock OTP generation
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

let currentOTP = "";

// Event Listeners
getOtpBtn.addEventListener("click", () => {
  if (aadharInput.value.length === 12) {
    currentOTP = generateOTP();
    alert(`Your OTP is: ${currentOTP}`); // In real application, this would be sent to phone
    otpSection.classList.remove("hidden");
  } else {
    alert("Please enter valid 12-digit Aadhar number");
  }
});

resendOtpBtn.addEventListener("click", () => {
  currentOTP = generateOTP();
  alert(`Your new OTP is: ${currentOTP}`); // In real application, this would be sent to phone
});

loginBtn.addEventListener("click", () => {
  if (otpInput.value.length === 6) {
    // Check if OTP is 6 digits
    if (otpInput.value === currentOTP) {
      loginSection.classList.add("hidden");
      dashboardSection.classList.remove("hidden");
    } else {
      alert("Invalid OTP");
    }
  } else {
    alert("Please enter a valid 6-digit OTP");
  }
});

// Add event listener for guide to login transition
startLoginBtn.addEventListener("click", () => {
  guideSection.classList.add("hidden");
  loginSection.classList.remove("hidden");
});

// Add input validation for Aadhar
aadharInput.addEventListener("input", (e) => {
  // Only allow numbers
  e.target.value = e.target.value.replace(/[^0-9]/g, "");
  // Limit to 12 digits
  if (e.target.value.length > 12) {
    e.target.value = e.target.value.slice(0, 12);
  }
});

// Add input validation for OTP
otpInput.addEventListener("input", (e) => {
  // Only allow numbers
  e.target.value = e.target.value.replace(/[^0-9]/g, "");
  // Limit to 6 digits
  if (e.target.value.length > 6) {
    e.target.value = e.target.value.slice(0, 6);
  }
});

// Function to handle fullscreen
function enterFullscreen() {
  const elem = document.documentElement;
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen();
  }
}

// Monitor tab visibility - only during exam
document.addEventListener("visibilitychange", () => {
  if (document.hidden && examStartTime) {
    // Only track if exam has started
    tabSwitches++;
    trustScore -= 5;
    alert("Warning: Tab switching detected!");
  }
});

// Monitor screen size
function checkScreenSize() {
  const expectedRatio = window.innerWidth / window.innerHeight;
  if (Math.abs(expectedRatio - 16 / 9) > 0.2) {
    trustScore -= 10;
    return false;
  }
  return true;
}

// Monitor mouse movements
document.addEventListener("mousemove", (e) => {
  if (examStartTime) {
    mouseMovements.push({
      x: e.clientX,
      y: e.clientY,
      timestamp: Date.now(),
    });
  }
});

// Monitor keyboard input
document.addEventListener("keydown", (e) => {
  if (examStartTime) {
    keyStrokes.push({
      key: e.key,
      timestamp: Date.now(),
    });
  }
});

// Analyze behavior patterns
function analyzeBehavior() {
  // Analyze mouse movements for unusual patterns
  if (mouseMovements.length > 100) {
    const unusualMovements = detectUnusualMouseMovements();
    if (unusualMovements) trustScore -= 2;
  }

  // Analyze typing patterns
  if (keyStrokes.length > 50) {
    const unusualTyping = detectUnusualTypingPattern();
    if (unusualTyping) trustScore -= 2;
  }

  return {
    trustScore,
    tabSwitches,
    unusualMovements: mouseMovements.length > 100,
    unusualTyping: keyStrokes.length > 50,
  };
}

// System diagnostics function - remove screen resolution check
runSystemCheckBtn.addEventListener("click", async () => {
  try {
    // Check camera
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    stream.getTracks().forEach((track) => track.stop()); // Stop camera after check

    // Check browser compatibility
    const browserCheck = /Chrome|Firefox/.test(navigator.userAgent);

    // Display results
    const diagnosticsResults = [
      { test: "Camera Access", status: "✅ Available" },
      {
        test: "Browser Compatibility",
        status: browserCheck ? "✅ Compatible" : "❌ Not Compatible",
      },
      {
        test: "Internet Connection",
        status: navigator.onLine ? "✅ Connected" : "❌ Not Connected",
      },
    ];

    let resultsHTML = '<div class="diagnostics-results">';
    diagnosticsResults.forEach((result) => {
      resultsHTML += `<p>${result.test}: ${result.status}</p>`;
    });
    resultsHTML += "</div>";

    alert(
      "Diagnostics Complete!\n\n" +
        diagnosticsResults.map((r) => `${r.test}: ${r.status}`).join("\n")
    );
  } catch (error) {
    alert("Diagnostics failed: " + error.message);
  }
});

// Exam timer function
let examTimeLeft = 30 * 60; // 30 minutes in seconds
let examTimerInterval;

function startExamTimer() {
  examTimerInterval = setInterval(() => {
    examTimeLeft--;
    const minutes = Math.floor(examTimeLeft / 60);
    const seconds = examTimeLeft % 60;
    examTimer.textContent = `Time Remaining: ${minutes}:${seconds
      .toString()
      .padStart(2, "0")}`;

    if (examTimeLeft <= 0) {
      clearInterval(examTimerInterval);
      submitExam();
    }
  }, 1000);
}

// Add screen size monitoring
let screenSizeInterval;

function startScreenMonitoring() {
  const initialWidth = window.innerWidth;
  const initialHeight = window.innerHeight;

  screenSizeInterval = setInterval(() => {
    if (examStartTime) {
      const currentRatio = window.innerWidth / window.innerHeight;
      const initialRatio = initialWidth / initialHeight;

      if (Math.abs(currentRatio - initialRatio) > 0.2) {
        trustScore -= 10;
        trustScoreElement.textContent = `Trust Score: ${trustScore}%`;
        alert("Warning: Screen resolution change detected!");
      }
    }
  }, 1000);
}

// Function to disable keyboard shortcuts and right-click
function disableShortcuts(e) {
  if (!examStartTime) return; // Only check during exam

  // Existing shortcut prevention
  if (
    e.ctrlKey &&
    (e.key === "c" ||
      e.key === "v" ||
      (e.shiftKey && e.key === "I") ||
      e.key === "u")
  ) {
    e.preventDefault();
    if (e.key === "c" || e.key === "v") {
      copyPasteCount++;
      console.log(`Copy/Paste count: ${copyPasteCount}`);
    }
    detectCheating(e);
    return false;
  }

  if (e.key === "F12") {
    e.preventDefault();
    return false;
  }

  // Regular keystroke monitoring
  detectCheating(e);
}

// Function to disable right-click
function disableRightClick(e) {
  e.preventDefault();
  return false;
}

// Function to disable shortcuts during exam
function enableExamRestrictions() {
  // Disable keyboard shortcuts
  document.addEventListener("keydown", disableShortcuts);

  // Disable right-click
  document.addEventListener("contextmenu", disableRightClick);

  // Disable text selection
  document.body.style.userSelect = "none";

  // Additional protection against DevTools
  setInterval(() => {
    const devtools = /./;
    devtools.toString = function () {
      examStartTime = null;
      submitExam();
      return "";
    };
  }, 1000);
}

// Function to remove exam restrictions
function disableExamRestrictions() {
  // Remove keyboard shortcuts listener
  document.removeEventListener("keydown", disableShortcuts);

  // Remove right-click listener
  document.removeEventListener("contextmenu", disableRightClick);

  // Enable text selection
  document.body.style.userSelect = "auto";
}

// Function to reset the counts and generate a new dynamic limit
function resetCount() {
  copyPasteCount = 0;
  rapidKeyCount = 0;
  mouseClickCount = 0;
  focusChangeCount = 0;
  dynamicLimit =
    Math.floor(Math.random() * (MAX_LIMIT - MIN_LIMIT + 1)) + MIN_LIMIT;
  console.log(`New dynamic limit set: ${dynamicLimit}`);
}

// Function to detect cheating
function detectCheating(event) {
  if (!examStartTime) return;

  const currentTime = Date.now();
  const timeSinceLastKey = currentTime - lastKeyTime;

  // Check for excessive Ctrl+C/Ctrl+V usage
  if (copyPasteCount >= dynamicLimit) {
    console.log("Cheating detected: Excessive copy-paste actions!");
    submitExam();
    return;
  }

  // Check for keystroke lag
  if (timeSinceLastKey > LAG_THRESHOLD) {
    console.log("Cheating detected: Unusual keystroke lag!");
    trustScore = Math.max(0, trustScore - 5); // Prevent negative scores
    return;
  }

  // Check for rapid repeated keystrokes
  if (
    event &&
    timeSinceLastKey < RAPID_KEY_THRESHOLD &&
    lastKey === event.key
  ) {
    rapidKeyCount++;
    if (rapidKeyCount > 5) {
      console.log("Cheating detected: Rapid repeated keystrokes!");
      trustScore = Math.max(0, trustScore - 5); // Prevent negative scores
      return;
    }
  } else {
    rapidKeyCount = 0;
  }

  // Check for excessive mouse clicks
  if (mouseClickCount > MOUSE_CLICK_THRESHOLD) {
    console.log("Cheating detected: Excessive mouse clicks!");
    trustScore = Math.max(0, trustScore - 5); // Prevent negative scores
    return;
  }

  // Check for excessive focus changes
  if (focusChangeCount > FOCUS_CHANGE_THRESHOLD) {
    console.log("Cheating detected: Excessive focus changes!");
    trustScore = Math.max(0, trustScore - 5); // Prevent negative scores
    return;
  }

  lastKeyTime = currentTime;
  if (event) lastKey = event.key;
}

// Add click monitoring
document.addEventListener("click", (e) => {
  if (!examStartTime) return;

  // Don't count clicks on legitimate exam interface elements
  if (e.target.matches('input[type="radio"], button, label')) {
    return;
  }

  mouseClickCount++;
  if (mouseClickCount > MOUSE_CLICK_THRESHOLD) {
    trustScore = Math.max(0, trustScore - 5); // Prevent negative scores
  }
});

// Add focus change monitoring
window.addEventListener("blur", () => {
  if (examStartTime) {
    focusChangeCount++;
    detectCheating();
  }
});

// Optimize performance by using requestAnimationFrame for monitoring
let monitoringFrame;
let lastCheck = Date.now();

// Optimized monitoring function
function monitorExam() {
  if (!examStartTime) return;

  const now = Date.now();
  if (now - lastCheck >= 100) {
    lastCheck = now;
  }

  monitoringFrame = requestAnimationFrame(monitorExam);
}

// Fix submit exam button by using proper ID
submitExamBtn.addEventListener("click", () => {
  submitExam();
});

// Wait for face-api.js to load
async function loadFaceDetectionModels() {
  try {
    // Wait for face-api to be defined
    await new Promise((resolve) => {
      if (window.faceapi) {
        resolve();
      } else {
        // Check every 100ms if face-api is loaded
        const checkInterval = setInterval(() => {
          if (window.faceapi) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
      }
    });

    // Load models from CDN
    const MODEL_URL =
      "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/";
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    ]);

    console.log("Face detection models loaded successfully");
    return true;
  } catch (error) {
    console.error("Error loading face detection models:", error);
    alert("Failed to load face detection models. Please refresh the page.");
    return false;
  }
}

// Update startExamBtn click handler
startExamBtn.addEventListener("click", async () => {
  try {
    // Show loading message
    const loadingMessage = document.createElement("div");
    loadingMessage.textContent = "Loading face detection models...";
    loadingMessage.style.position = "fixed";
    loadingMessage.style.top = "50%";
    loadingMessage.style.left = "50%";
    loadingMessage.style.transform = "translate(-50%, -50%)";
    loadingMessage.style.padding = "20px";
    loadingMessage.style.background = "white";
    loadingMessage.style.borderRadius = "8px";
    loadingMessage.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
    document.body.appendChild(loadingMessage);

    // Load face detection models
    const modelsLoaded = await loadFaceDetectionModels();

    // Remove loading message
    document.body.removeChild(loadingMessage);

    if (!modelsLoaded) {
      return;
    }

    // Start camera for initial check
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: 640,
        height: 480,
        frameRate: { ideal: 10, max: 15 },
      },
    });
    cameraCheckVideo.srcObject = stream;
    cameraCheckModal.classList.remove("hidden");

    // Start continuous face detection during camera check
    const faceCheckInterval = setInterval(async () => {
      const result = await detectFaces(cameraCheckVideo);
      const instructions = document.getElementById("cameraInstructions");
      instructions.textContent = result.message;
      instructions.style.color = result.valid ? "#28a745" : "#dc3545";

      // Enable/disable start exam button based on face detection
      startExamWithCameraBtn.disabled = !result.valid;
    }, 1000);

    // Store interval for cleanup
    window.examIntervals = window.examIntervals || [];
    window.examIntervals.push(faceCheckInterval);
  } catch (error) {
    console.error("Error starting exam:", error);
    alert("Failed to start exam: " + error.message);
  }
});

// Update detectFaces function to handle errors better
async function detectFaces(video) {
  try {
    if (!faceapi || !video.srcObject) {
      return {
        valid: false,
        message: "Face detection not ready. Please wait...",
      };
    }

    const detections = await faceapi.detectAllFaces(
      video,
      new faceapi.TinyFaceDetector()
    );

    if (!detections) {
      return {
        valid: false,
        message: "Face detection failed. Please try again.",
      };
    }

    if (detections.length === 0) {
      return {
        valid: false,
        message: "No face detected. Please ensure your face is visible.",
      };
    } else if (detections.length > 1) {
      return {
        valid: false,
        message: "Multiple faces detected. Please ensure you are alone.",
      };
    }

    return {
      valid: true,
      message: "Face check passed.",
    };
  } catch (error) {
    console.error("Face detection error:", error);
    return {
      valid: false,
      message: "Face detection error. Please refresh the page.",
    };
  }
}

// Start exam with camera button handler
startExamWithCameraBtn.addEventListener("click", async () => {
  try {
    // Final face check before starting
    const result = await detectFaces(cameraCheckVideo);
    if (!result.valid) {
      alert(result.message);
      return;
    }

    // Clear face check interval
    window.examIntervals.forEach((interval) => clearInterval(interval));
    window.examIntervals = [];

    // Hide camera check modal
    cameraCheckModal.classList.add("hidden");

    // Continue with exam start...
    await enterFullscreen();

    setTimeout(async () => {
      enableExamRestrictions();
      examStartTime = Date.now();

      // Initialize monitoring
      resetCount();
      monitorExam();

      // Update UI
      dashboardSection.classList.add("hidden");
      examSection.classList.remove("hidden");
      monitoringSection.classList.remove("hidden");

      // Transfer camera stream to monitoring video
      videoElement.srcObject = cameraCheckVideo.srcObject;

      // Start continuous face monitoring during exam
      const examFaceCheckInterval = setInterval(async () => {
        const examResult = await detectFaces(videoElement);
        if (!examResult.valid) {
          trustScore = Math.max(0, trustScore - 10);
          console.log(examResult.message);
        }
      }, 2000);

      window.examIntervals.push(examFaceCheckInterval);

      // Start other monitoring
      startExamTimer();
      startScreenMonitoring();

      // Reset variables
      mouseMovements = [];
      keyStrokes = [];
      tabSwitches = 0;
      trustScore = 100;
    }, 1000);
  } catch (error) {
    alert("Failed to start exam: " + error.message);
  }
});

// Update cleanup to properly handle camera streams
function cleanupMonitoring() {
  if (monitoringFrame) {
    cancelAnimationFrame(monitoringFrame);
  }

  // Stop all camera streams
  if (videoElement.srcObject) {
    const tracks = videoElement.srcObject.getTracks();
    tracks.forEach((track) => track.stop());
  }
  if (cameraCheckVideo.srcObject) {
    const tracks = cameraCheckVideo.srcObject.getTracks();
    tracks.forEach((track) => track.stop());
  }

  clearInterval(examTimerInterval);
  clearInterval(screenSizeInterval);
  if (window.examIntervals) {
    window.examIntervals.forEach((interval) => clearInterval(interval));
    window.examIntervals = [];
  }
}

// Update submit exam function
function submitExam() {
  if (!examStartTime) return; // Prevent multiple submissions

  cleanupMonitoring();
  disableExamRestrictions();
  examStartTime = null;

  // Generate report
  const behaviorAnalysis = analyzeBehavior();
  const mockScore = Math.floor(Math.random() * 41) + 60;

  // Update report content
  trustMetrics.innerHTML = `
        <p>Final Trust Score: ${trustScore}%</p>
    `;

  examResults.innerHTML = `
        <p>Score: ${mockScore}%</p>
        <p>Time Taken: ${(30 * 60 - examTimeLeft) / 60} minutes</p>
    `;

  // Show report
  examSection.classList.add("hidden");
  monitoringSection.classList.add("hidden");
  reportSection.classList.remove("hidden");
}

// Update return to dashboard function
returnToDashboardBtn.addEventListener("click", () => {
  cleanupMonitoring();
  disableExamRestrictions();
  examStartTime = null;

  reportSection.classList.add("hidden");
  dashboardSection.classList.remove("hidden");

  // Reset state
  examTimeLeft = 30 * 60;
  trustScore = 100;
  mouseMovements = [];
  keyStrokes = [];
  tabSwitches = 0;
  resetCount();
});

// Optimize camera initialization
async function setupCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: 640,
        height: 480,
        frameRate: { ideal: 10, max: 15 }, // Reduce frame rate for better performance
      },
    });
    videoElement.srcObject = stream;
    return new Promise((resolve) => {
      videoElement.onloadedmetadata = () => resolve();
    });
  } catch (error) {
    alert("Camera access is required for the exam");
    throw error;
  }
}

// Mock functions for behavior analysis
function detectUnusualMouseMovements() {
  // Mock implementation
  return mouseMovements.length > 1000; // Arbitrary threshold
}

function detectUnusualTypingPattern() {
  // Mock implementation
  return keyStrokes.length > 500; // Arbitrary threshold
}

async function init() {
  await setupCamera();
  statusElement.textContent = "Camera initialized. Starting face detection...";
  detectGaze();

  // Additional initialization
  mouseMovements = [];
  keyStrokes = [];
  tabSwitches = 0;
  trustScore = 100;
}

// Update HTML to add face-api.js script
document.addEventListener("DOMContentLoaded", () => {
  // Add face-api.js script
  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/face-api.js";
  document.head.append(script);
});
function detectUnusualTypingPattern() {
  // Mock implementation
  return keyStrokes.length > 500; // Arbitrary threshold
}

async function init() {
  await setupCamera();
  statusElement.textContent = "Camera initialized. Starting face detection...";
  detectGaze();

  // Additional initialization
  mouseMovements = [];
  keyStrokes = [];
  tabSwitches = 0;
  trustScore = 100;
}

// Update HTML to add face-api.js script
document.addEventListener("DOMContentLoaded", () => {
  // Add face-api.js script
  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/face-api.js";
  document.head.append(script);
});
