const handleMongooseError = (err) => {
  const targetError = err.cause || err;

  if (targetError.code === 11000) {
    const field = Object.keys(targetError.keyValue)[0];
    return {
      statusCode: 409,
      message: "Duplicate entry found",
      errors: {
        [field]: `This ${field} is already in use`,
      },
    };
  }

  if (err.name === "ValidationError") {
    const errors = {};
    Object.keys(err.errors).forEach((key) => {
      errors[key] = err.errors[key].message;
    });
    return {
      statusCode: 422,
      message: "Validation failed",
      errors,
    };
  }

  if (err.name === "CastError") {
    return {
      statusCode: 400,
      message: "Invalid resource ID",
      errors: {
        [err.path]: `Invalid ${err.path}: ${err.value}`,
      },
    };
  }

  if (err.name === "MongoServerError") {
    return {
      statusCode: 400,
      message: "Database operation failed",
      errors: {
        database: err.message,
      },
    };
  }

  if (err.message && err.message.includes("unique")) {
    const fieldMatch = err.message.match(/index: (\w+)_1/);
    const field = fieldMatch ? fieldMatch[1] : "field";
    return {
      statusCode: 409,
      message: "Duplicate entry found",
      errors: {
        [field]: `This ${field} is already in use`,
      },
    };
  }

  return {
    statusCode: 400,
    message: "Database operation failed",
    errors: {
      general: err.message,
    },
  };
};

const handleJWTError = (err) => {
  if (err.name === "JsonWebTokenError") {
    return {
      statusCode: 401,
      message: "Invalid authentication token",
      errors: {
        token: "Please provide a valid token",
      },
    };
  }

  if (err.name === "TokenExpiredError") {
    return {
      statusCode: 401,
      message: "Authentication token expired",
      errors: {
        token: "Please login again",
      },
    };
  }

  return {
    statusCode: 401,
    message: "Authentication failed",
    errors: {
      token: err.message,
    },
  };
};

const errorMiddleware = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.status || 500;
  let message = err.message || "Internal Server Error";
  let errors = err.errors || null;

  if (
    err.name === "MongoError" ||
    err.name === "MongoServerError" ||
    err.name === "MongooseError" ||
    err.name === "ValidationError" ||
    err.name === "CastError" ||
    (err.cause &&
      (err.cause.name === "MongoError" ||
        err.cause.name === "MongoServerError" ||
        err.cause.code === 11000))
  ) {
    const mongooseError = handleMongooseError(err);
    statusCode = mongooseError.statusCode;
    message = mongooseError.message;
    errors = mongooseError.errors;
  } else if (
    err.name === "JsonWebTokenError" ||
    err.name === "TokenExpiredError"
  ) {
    const jwtError = handleJWTError(err);
    statusCode = jwtError.statusCode;
    message = jwtError.message;
    errors = jwtError.errors;
  } else if (err.name === "AppError" && err.errors) {
    if (Array.isArray(err.errors)) {
      errors = {};
      err.errors.forEach((error) => {
        if (error.field) errors[error.field] = error.message;
        else errors.general = error.message;
      });
    } else {
      errors = err.errors;
    }
  }

  res.status(statusCode).json({
    success: false,
    message,  
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      errorName: err.name,
    }),
  });
};

export default errorMiddleware;
