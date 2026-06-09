const BACKEND_URL = 'http://localhost:5000';

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
