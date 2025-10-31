// HTTP Cache Headers Middleware
// Adds proper cache-control headers to responses for better browser caching

export function setCacheHeaders(maxAge = 300) {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method === 'GET') {
      // Set cache control headers
      res.set('Cache-Control', `public, max-age=${maxAge}`);
      res.set('ETag', `W/"${Date.now()}"`);
    }
    next();
  };
}

export function setNoCacheHeaders() {
  return (req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
  };
}

// Add compression
export function enableCompression() {
  return (req, res, next) => {
    res.set('Vary', 'Accept-Encoding');
    next();
  };
}
