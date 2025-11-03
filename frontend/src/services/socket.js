import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect(token) {
    if (this.socket && this.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      this.connected = true;
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
      console.log('Socket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  joinCommunity(communityId) {
    if (this.socket && this.connected) {
      this.socket.emit('join-community', communityId);
    }
  }

  leaveCommunity(communityId) {
    if (this.socket && this.connected) {
      this.socket.emit('leave-community', communityId);
    }
  }

  sendMessage(data) {
    if (this.socket && this.connected) {
      this.socket.emit('send-message', data);
    }
  }

  sendTyping(data) {
    if (this.socket && this.connected) {
      this.socket.emit('typing', data);
    }
  }

  deleteMessage(messageId) {
    if (this.socket && this.connected) {
      this.socket.emit('delete-message', { messageId });
    }
  }

  pinMessage(messageId) {
    if (this.socket && this.connected) {
      this.socket.emit('pin-message', { messageId });
    }
  }

  editMessage(messageId, content) {
    if (this.socket && this.connected) {
      this.socket.emit('edit-message', { messageId, content });
    }
  }

  addReaction(messageId, emoji) {
    if (this.socket && this.connected) {
      this.socket.emit('add-reaction', { messageId, emoji });
    }
  }

  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('new-message', callback);
    }
  }

  onUserOnline(callback) {
    if (this.socket) {
      this.socket.on('user-online', callback);
    }
  }

  onUserOffline(callback) {
    if (this.socket) {
      this.socket.on('user-offline', callback);
    }
  }

  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('user-typing', callback);
    }
  }

  onMessageDeleted(callback) {
    if (this.socket) {
      this.socket.on('message-deleted', callback);
    }
  }

  onMessagePinned(callback) {
    if (this.socket) {
      this.socket.on('message-pinned', callback);
    }
  }

  onJoinedCommunity(callback) {
    if (this.socket) {
      this.socket.on('joined-community', callback);
    }
  }

  onMessageEdited(callback) {
    if (this.socket) {
      this.socket.on('message-edited', callback);
    }
  }

  onReactionUpdated(callback) {
    if (this.socket) {
      this.socket.on('reaction-updated', callback);
    }
  }

  onError(callback) {
    if (this.socket) {
      this.socket.on('error', callback);
    }
  }

  offEvent(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  isConnected() {
    return this.connected;
  }
}

export default new SocketService();
