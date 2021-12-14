class InvariantError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'InvariantError';
  }
}

module.exports = InvariantError;
