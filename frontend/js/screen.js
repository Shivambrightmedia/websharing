// DOM Elements
const waitingState = document.getElementById('waitingState');
const imageDisplay = document.getElementById('imageDisplay');
const displayImage = document.getElementById('displayImage');
const screenStatus = document.getElementById('screenStatus');
const statusText = document.getElementById('statusText');

// Initialize Socket.IO connection
function initSocket() {
    const socket = io(CONFIG.SERVER_URL);

    socket.on('connect', () => {
        updateConnectionStatus(true);
    });

    socket.on('disconnect', () => {
        updateConnectionStatus(false);
    });

    socket.on('connect_error', () => {
        updateConnectionStatus(false);
    });

    // Listen for new images
    socket.on('new-image', (imageUrl) => {
        console.log('Received new image:', imageUrl);
        showImage(imageUrl);
    });
}

// Update connection status UI
function updateConnectionStatus(connected) {
    const dot = screenStatus.querySelector('.status-dot');

    if (connected) {
        dot.classList.remove('disconnected');
        dot.classList.add('connected');
        statusText.textContent = 'Connected';
    } else {
        dot.classList.remove('connected');
        dot.classList.add('disconnected');
        statusText.textContent = 'Disconnected';
    }
}

// Show image with animation
function showImage(imageUrl) {
    // Create a new image to preload
    const img = new Image();
    img.onload = () => {
        // Fade out current content
        if (!waitingState.classList.contains('hidden')) {
            waitingState.classList.add('fade-out');
            setTimeout(() => {
                waitingState.classList.add('hidden');
                waitingState.classList.remove('fade-out');
            }, 500);
        }

        // Fade out old image if exists
        if (!imageDisplay.classList.contains('hidden')) {
            displayImage.classList.add('fade-out');
            setTimeout(() => {
                displayImage.src = imageUrl;
                displayImage.classList.remove('fade-out');
                displayImage.classList.add('fade-in');
                setTimeout(() => {
                    displayImage.classList.remove('fade-in');
                }, 500);
            }, 300);
        } else {
            // Show image display area
            displayImage.src = imageUrl;
            imageDisplay.classList.remove('hidden');
            imageDisplay.classList.add('fade-in');
            setTimeout(() => {
                imageDisplay.classList.remove('fade-in');
            }, 500);
        }
    };

    img.src = imageUrl;
}

// Initialize
initSocket();
