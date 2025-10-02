import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const useWebSocket = (url) => {
  const [data, setData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!url) return;

    console.log('🔌 Initializing WebSocket connection to:', url);

    // Initialize socket connection
    socketRef.current = io(url, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity
    });

    const socket = socketRef.current;

    // Connection events
    socket.on('connect', () => {
      console.log('✅ WebSocket connected successfully');
      setIsConnected(true);
      setError(null);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.log('⚠️ WebSocket connection error:', err.message);
      setError(err.message);
      setIsConnected(false);
    });

    // Dashboard events
    socket.on('dashboard:update', (newData) => {
      console.log('📊 Dashboard update received:', newData);
      setData(newData);
    });

    socket.on('dashboard:alert', (alertData) => {
      console.log('🚨 Dashboard alert received:', alertData);
      setData(prevData => ({
        ...prevData,
        alert: alertData
      }));
    });

    socket.on('dashboard:mode', (modeData) => {
      console.log('🔄 Dashboard mode change received:', modeData);
      setData(prevData => ({
        ...prevData,
        mode: modeData
      }));
    });

    // Cleanup function
    return () => {
      console.log('🔌 Cleaning up WebSocket connection');
      if (socket) {
        socket.disconnect();
      }
    };
  }, [url]);

  const sendMessage = useCallback((event, data) => {
    if (socketRef.current && isConnected) {
      console.log('📤 Sending message:', event, data);
      socketRef.current.emit(event, data);
    } else {
      console.log('⚠️ Cannot send message - socket not connected');
    }
  }, [isConnected]);

  return {
    data,
    isConnected,
    error,
    sendMessage
  };
};

export default useWebSocket;