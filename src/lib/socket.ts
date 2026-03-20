import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  transports: ['websocket'],
});

export const connectSocket = (restaurantId?: string, tableId?: string) => {
  if (!socket.connected) {
    socket.connect();
  }

  if (restaurantId) {
    socket.emit('join_restaurant', restaurantId);
  }

  if (tableId) {
    socket.emit('join_table', tableId);
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};
