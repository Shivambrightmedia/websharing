// DOM Elements
const fileInput = document.getElementById('fileInput');
const captureBtn = document.getElementById('captureBtn');
const imagePreview = document.getElementById('imagePreview');
const placeholder = document.getElementById('placeholder');
const submitBtn = document.getElementById('submitBtn');
const statusContainer = document.getElementById('statusContainer');
const statusMessage = document.getElementById('statusMessage');
const connectionStatus = document.getElementById('connectionStatus');

// State
let selectedFile = null;
let socket = null;

// Initialize Socket.IO connection
function initSocket() {
    socket = io(CONFIG.SERVER_URL);

    socket.on('connect', () => {
        updateConnectionStatus(true);
    });

    socket.on('disconnect', () => {
        updateConnectionStatus(false);
    });

    socket.on('connect_error', () => {
        updateConnectionStatus(false);
    });
}

// Update connection status UI
function updateConnectionStatus(connected) {
    const dot = connectionStatus.querySelector('.status-dot');
    const text = connectionStatus.querySelector('span:last-child');

    if (connected) {
        dot.classList.remove('disconnected');
        dot.classList.add('connected');
        text.textContent = 'Connected';
    } else {
        dot.classList.remove('connected');
        dot.classList.add('disconnected');
        text.textContent = 'Disconnected';
    }
}

// Handle capture button click
captureBtn.addEventListener('click', () => {
    fileInput.click();
});

// Handle file selection
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        selectedFile = file;
        showPreview(file);
    }
});

// Show image preview
function showPreview(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        imagePreview.src = e.target.result;
        imagePreview.classList.remove('hidden');
        placeholder.classList.add('hidden');
        submitBtn.classList.remove('hidden');

        // Add animation
        imagePreview.classList.add('fade-in');
    };
    reader.readAsDataURL(file);
}

// Handle submit button click
submitBtn.addEventListener('click', async () => {
    if (!selectedFile) return;

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="btn-icon">⏳</span><span>Uploading...</span>';
    showStatus('Uploading to cloud...', 'info');

    try {
        const imageUrl = await uploadToCloudinary(selectedFile);

        // Emit to server
        if (socket && socket.connected) {
            socket.emit('new-image', imageUrl);
            showStatus('Photo shared successfully! 🎉', 'success');
        } else {
            showStatus('Not connected to server', 'error');
        }

        // Reset for next capture
        setTimeout(() => {
            resetForm();
        }, 2000);

    } catch (error) {
        console.error('Upload failed:', error);
        showStatus('Upload failed. Please try again.', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span class="btn-icon">🚀</span><span>Submit Photo</span>';
    }
});

// Upload to Cloudinary
async function uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CONFIG.CLOUDINARY.UPLOAD_PRESET);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CONFIG.CLOUDINARY.CLOUD_NAME}/image/upload`,
        {
            method: 'POST',
            body: formData
        }
    );

    if (!response.ok) {
        throw new Error('Upload failed');
    }

    const data = await response.json();
    return data.secure_url;
}

// Show status message
function showStatus(message, type) {
    statusContainer.classList.remove('hidden');
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
}

// Reset form for next capture
function resetForm() {
    selectedFile = null;
    fileInput.value = '';
    imagePreview.classList.add('hidden');
    imagePreview.classList.remove('fade-in');
    placeholder.classList.remove('hidden');
    submitBtn.classList.add('hidden');
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<span class="btn-icon">🚀</span><span>Submit Photo</span>';
    statusContainer.classList.add('hidden');
}

// Initialize
initSocket();
