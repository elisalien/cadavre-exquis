import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

let socket = null;

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState('good'); // good, fair, poor

  useEffect(() => {
    if (!socket) {
      socket = io(BACKEND_URL, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });
    }

    const handleConnect = () => {
      setIsConnected(true);
      setConnectionQuality('good');
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setConnectionQuality('poor');
    };

    const handleConnectionStatus = (data) => {
      setConnectionQuality(data.status === 'connected' ? 'good' : 'poor');
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connection_status', handleConnectionStatus);

    // Heartbeat
    const pingInterval = setInterval(() => {
      if (socket.connected) {
        const start = Date.now();
        socket.emit('ping');
        socket.once('pong', () => {
          const latency = Date.now() - start;
          if (latency < 100) setConnectionQuality('good');
          else if (latency < 300) setConnectionQuality('fair');
          else setConnectionQuality('poor');
        });
      }
    }, 5000);

    return () => {
      clearInterval(pingInterval);
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connection_status', handleConnectionStatus);
    };
  }, []);

  return { socket, isConnected, connectionQuality };
};
