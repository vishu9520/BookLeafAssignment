import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect to server (either root or custom backend URL)
    const socketUrl = import.meta.env.VITE_API_URL || '/';
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    newSocket.on('connect', () => {
      // console.log('[Socket] Connected to server:', newSocket.id);
      setIsConnected(true);

      // Join appropriate rooms based on authenticated user
      if (user) {
        if (user.role === 'author' && user.author_id) {
          newSocket.emit('join:author', user.author_id);
        } else if (user.role === 'admin') {
          newSocket.emit('join:admin');
        }
      }
    });

    newSocket.on('disconnect', () => {
      // console.log('[Socket] Disconnected from server');
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within a SocketProvider');
  return ctx;
};
