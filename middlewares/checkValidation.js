import AppError from "../utils/appError.js";

const checkValidation = (_schema) => {
  return (req, res, next) => {
    if (!req.body || Object.keys(req.body).length === 0) {
      return next(new AppError("No data provided", 400));
    }


    const { error, value } = _schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: false,
    });

    if (error) {
      const errObj = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      const validationError = new AppError("Validation Error!", 400);
      validationError.errors = errObj;
      return next(validationError);
    }

    req.body = value;
    next();
  };
};

export default checkValidation;
