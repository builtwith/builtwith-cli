'use strict';

const EXIT_CODES = {
  SUCCESS: 0,
  UNEXPECTED: 1,
  AUTH: 2,
  NOT_FOUND: 3,
  RATE_LIMIT: 4,
  API_ERROR: 5,
  NETWORK: 6,
  INVALID_INPUT: 7,
  INTERRUPTED: 8,
};

class BuiltWithError extends Error {
  constructor(message, exitCode) {
    super(message);
    this.name = this.constructor.name;
    this.exitCode = exitCode;
  }
}

class InputError extends BuiltWithError {
  constructor(message) {
    super(message, EXIT_CODES.INVALID_INPUT);
  }
}

class ConfigError extends BuiltWithError {
  constructor(message) {
    super(message, EXIT_CODES.AUTH);
  }
}

class ApiError extends BuiltWithError {
  constructor(message, statusCode) {
    let exitCode = EXIT_CODES.API_ERROR;
    if (statusCode === 401 || statusCode === 403) exitCode = EXIT_CODES.AUTH;
    else if (statusCode === 404) exitCode = EXIT_CODES.NOT_FOUND;
    else if (statusCode === 429) exitCode = EXIT_CODES.RATE_LIMIT;
    super(message, exitCode);
    this.statusCode = statusCode;
  }
}

class NetworkError extends BuiltWithError {
  constructor(message) {
    super(message, EXIT_CODES.NETWORK);
  }
}

module.exports = { EXIT_CODES, BuiltWithError, InputError, ConfigError, ApiError, NetworkError };
