import { io } from "socket.io-client";

// URL của backend server
const SOCKET_URL = "http://localhost:3000";

// Khởi tạo đối tượng socket với cấu hình tùy chỉnh
export const socket = io(SOCKET_URL, {
    autoConnect: false, // Không tự động kết nối ngay khi file được import (kết nối chủ động khi render component)
    transports: ["websocket", "polling"], // Ưu tiên websocket
    withCredentials: true,
});
