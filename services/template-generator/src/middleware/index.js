// Export all middleware
module.exports = {
  authMiddleware: require('./auth'),
  validationMiddleware: require('./validation'),
  errorMiddleware: require('./errorHandler'),
  loggingMiddleware: require('./logging'),
};