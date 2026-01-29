const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Enable CORS for Netlify frontend
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins (update with your Netlify URL in production)
        methods: ["GET", "POST"]
    }
});

// Store the latest image URL
let latestImage = null;

app.use(cors());

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ 
        status: 'Server is running',
        latestImage: latestImage 
    });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Send the latest image to newly connected clients
    if (latestImage) {
        socket.emit('new-image', latestImage);
    }
    
    // Handle new image upload from mobile
    socket.on('new-image', (imageUrl) => {
        console.log('New image received:', imageUrl);
        latestImage = imageUrl;
        
        // Broadcast to ALL connected clients (including sender)
        io.emit('new-image', imageUrl);
    });
    
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
