// Central API configuration
// In development, Vite proxy handles /api → localhost:5001
// In production (GitHub Pages), this points to the Render backend URL
export const API_BASE = (import.meta as any).env?.VITE_BACKEND_URL || '';
