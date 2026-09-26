// Central API configuration
// If hosted directly on the same domain as the backend (like on Render), use empty string (relative URL)
// Otherwise (e.g. GitHub Pages or separate frontend host), point to https://accounthing.onrender.com
export const API_BASE = (import.meta as any).env?.VITE_BACKEND_URL !== undefined 
  ? (import.meta as any).env?.VITE_BACKEND_URL 
  : (typeof window !== 'undefined' && window.location.hostname.includes('render.com') 
      ? '' 
      : 'https://accounthing.onrender.com');


