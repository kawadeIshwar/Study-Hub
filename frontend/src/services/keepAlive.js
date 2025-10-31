// Keep-alive service to prevent backend cold starts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://studyhub-backend-kxxh.onrender.com';

class KeepAliveService {
  constructor() {
    this.pingInterval = null;
    this.isActive = false;
    this.PING_INTERVAL = 4 * 60 * 1000; // Ping every 4 minutes (before 5 min timeout)
    this.lastPing = null;
    this.failureCount = 0;
    this.MAX_FAILURES = 3;
  }

  // Start keep-alive pings
  start() {
    if (this.isActive) return;

    console.log('🔄 Starting backend keep-alive service...');
    this.isActive = true;
    
    // Initial ping
    this.ping();

    // Set up interval
    this.pingInterval = setInterval(() => {
      this.ping();
    }, this.PING_INTERVAL);

    // Ping on page visibility change
    this.setupVisibilityListener();
  }

  // Stop keep-alive pings
  stop() {
    console.log('🛑 Stopping backend keep-alive service...');
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    this.isActive = false;
  }

  // Send ping to backend
  async ping() {
    try {
      const startTime = Date.now();
      await axios.get(`${API_URL}/api/status`, {
        timeout: 10000 // 10 second timeout
      });
      const responseTime = Date.now() - startTime;
      
      this.lastPing = new Date();
      this.failureCount = 0;
      
      console.log(`✅ Backend ping successful (${responseTime}ms) at ${this.lastPing.toLocaleTimeString()}`);
      
      // Emit custom event for UI to show status
      window.dispatchEvent(new CustomEvent('backend-status', { 
        detail: { 
          status: 'online', 
          responseTime,
          timestamp: this.lastPing 
        } 
      }));

    } catch (error) {
      this.failureCount++;
      console.error(`❌ Backend ping failed (${this.failureCount}/${this.MAX_FAILURES}):`, error.message);
      
      // Emit offline event
      window.dispatchEvent(new CustomEvent('backend-status', { 
        detail: { 
          status: 'offline', 
          error: error.message,
          failureCount: this.failureCount 
        } 
      }));

      // If too many failures, stop pinging temporarily
      if (this.failureCount >= this.MAX_FAILURES) {
        console.warn('⚠️ Too many failures, pausing keep-alive for 2 minutes...');
        this.stop();
        setTimeout(() => {
          this.failureCount = 0;
          this.start();
        }, 2 * 60 * 1000);
      }
    }
  }

  // Setup listener for page visibility
  setupVisibilityListener() {
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isActive) {
        // Page became visible, ping immediately
        const timeSinceLastPing = this.lastPing ? Date.now() - this.lastPing.getTime() : Infinity;
        
        // If last ping was more than 2 minutes ago, ping now
        if (timeSinceLastPing > 2 * 60 * 1000) {
          console.log('🔄 Page visible, pinging backend...');
          this.ping();
        }
      }
    });
  }

  // Get status
  getStatus() {
    return {
      isActive: this.isActive,
      lastPing: this.lastPing,
      failureCount: this.failureCount
    };
  }
}

// Export singleton instance
const keepAliveService = new KeepAliveService();
export default keepAliveService;
