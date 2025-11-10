import { Platform } from "react-native";

// 🖥️ Your local backend
const LOCAL_IP = "";
const LOCAL_PORT = 8000;

// 🧩 Base URLs (for development)
export const BASE_URL = `http://${LOCAL_IP}:${LOCAL_PORT}`;
export const API_BASE = BASE_URL;