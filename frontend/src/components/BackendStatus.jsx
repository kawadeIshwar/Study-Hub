import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

/**
 * BackendStatus - Shows backend connection status
 * Listens to backend-status events from keep-alive service
 */
export default function BackendStatus() {
  const [status, setStatus] = useState({
    online: true,
    responseTime: null,
    lastCheck: null
  });
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const handleBackendStatus = (event) => {
      const { status: backendStatus, responseTime, timestamp } = event.detail;
      
      setStatus({
        online: backendStatus === 'online',
        responseTime,
        lastCheck: timestamp || new Date()
      });
    };

    window.addEventListener('backend-status', handleBackendStatus);

    return () => {
      window.removeEventListener('backend-status', handleBackendStatus);
    };
  }, []);

  // Don't show if everything is fine (optional - remove if you want always visible)
  if (status.online && !showDetails) {
    return null;
  }

  return (
    <div 
      className="fixed bottom-4 right-4 z-50"
      onMouseEnter={() => setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
    >
      {/* Status Indicator */}
      <div className={`
        flex items-center gap-2 px-4 py-2 rounded-full shadow-lg
        transition-all duration-300 cursor-pointer
        ${status.online 
          ? 'bg-green-500 text-white' 
          : 'bg-red-500 text-white animate-pulse'
        }
      `}>
        {status.online ? (
          <>
            <Wifi className="w-4 h-4" />
            <span className="text-sm font-medium">Connected</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span className="text-sm font-medium">Connecting...</span>
          </>
        )}
      </div>

      {/* Details Panel */}
      {showDetails && (
        <div className="absolute bottom-full right-0 mb-2 w-64 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
            Backend Status
          </h3>
          
          <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className={`font-medium ${status.online ? 'text-green-600' : 'text-red-600'}`}>
                {status.online ? 'Online' : 'Offline'}
              </span>
            </div>
            
            {status.responseTime && (
              <div className="flex justify-between">
                <span>Response Time:</span>
                <span className="font-medium">
                  {status.responseTime}ms
                </span>
              </div>
            )}
            
            {status.lastCheck && (
              <div className="flex justify-between">
                <span>Last Check:</span>
                <span className="font-medium">
                  {new Date(status.lastCheck).toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {status.online 
                ? '✅ Backend is warm and ready'
                : '⏳ Waking up backend server...'
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
