import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, isConnected: false });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const retryCount = useRef(0);
  const maxRetries = 3;

  useEffect(() => {
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

    const initializeSocket = () => {
      if (socketRef.current) {
        console.log('Cleaning up existing socket connection...');
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      console.log(`Initializing socket connection to: ${SOCKET_URL} (Attempt ${retryCount.current + 1}/${maxRetries})`);

      const socketInstance = io(SOCKET_URL, {
        transports: ['websocket'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
        timeout: 5000,
        forceNew: true,
        withCredentials: true,
        extraHeaders: {
          "Access-Control-Allow-Origin": "*"
        },
        path: '/socket.io/',
      });

      socketInstance.on("connect_timeout", (timeout) => {
        console.log("Connection timeout:", timeout);
      });

      socketRef.current = socketInstance;
      setSocket(socketInstance);

      const handleConnect = () => {
        console.log('Socket connected successfully:', socketInstance.id);
        console.log('Transport type:', socketInstance.io.engine.transport.name);
        retryCount.current = 0;
        setIsConnected(true);
      };

      const handleDisconnect = (reason: string) => {
        console.log('Socket disconnected:', reason);
        setIsConnected(false);

        // Attempt manual reconnection if we haven't exceeded maxRetries
        if (retryCount.current < maxRetries) {
          retryCount.current += 1;
          console.log(`Manual reconnection attempt ${retryCount.current}/${maxRetries}`);
          setTimeout(initializeSocket, 2000);
        } else {
          console.error('Max reconnection attempts reached');
        }
      };

      const handleError = (error: Error) => {
        console.error('Socket connection error:', error);
        console.log('Current transport:', socketInstance.io.engine.transport.name);
        console.log('Connection state:', socketInstance.connected);
        console.log('Attempting to reconnect automatically...');
        setIsConnected(false);
      };

      socketInstance.io.on('reconnect_attempt', (attempt: number) => {
        console.log(`Reconnection attempt ${attempt}`);
      });

      socketInstance.io.on('reconnect_failed', () => {
        console.error('Failed to reconnect after all attempts');
      });

      socketInstance.io.on('reconnect_error', (error) => {
        console.error('Reconnection error:', error);
      });

      socketInstance.on('connect', handleConnect);
      socketInstance.on('disconnect', handleDisconnect);
      socketInstance.on('connect_error', handleError);

      return () => {
        socketInstance.off('connect', handleConnect);
        socketInstance.off('disconnect', handleDisconnect);
        socketInstance.off('connect_error', handleError);
        socketInstance.disconnect();
        socketRef.current = null;
      };
    };

    initializeSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}; 