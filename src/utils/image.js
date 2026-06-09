const BACKEND_URL = 'https://derma-secret-backend.onrender.com';

export const getImageUrl = (url) => {
  if (!url) return '/assets/products/placeholder.png';
  
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  if (url.startsWith('/')) {
    return `${BACKEND_URL}${url}`;
  }
  
  return `${BACKEND_URL}/${url}`;
};
