export function errorHandler(err, req, res, next) {
  console.error('Unhandled Server Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected server error occurred.';

  res.status(statusCode).json({
    success: false,
    message,
    // Only return stack traces in development if desired
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}
