require("dotenv").config(); // System Core Initialized

const connectDB = require("./config/db");
const app = require("./app");
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, { cors: { origin: '*'} });
global.io = io;

// Connect to Database
connectDB();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Initialize Automated OSINT Fetching (Every 10 minutes)
  const { fetchOSINT } = require("./services/osint.service");
  setInterval(async () => {
    try {
      console.log("[SYSTEM] INITIALIZING AUTOMATED OSINT SYNC...");
      await fetchOSINT();
      console.log("[SYSTEM] OSINT SYNC COMPLETE.");
      if (global.io) {
        global.io.emit('intel:update');
      }
    } catch (err) {
      console.error("[SYSTEM] OSINT AUTO-FETCH ERROR:", err.message);
    }
  }, 600000); // 10 minutes
});
