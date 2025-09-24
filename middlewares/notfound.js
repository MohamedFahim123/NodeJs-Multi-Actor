import AppError from "../utils/appError.js";

const notFoundMiddleWare = (req, res, next) => {
  const error = new AppError(
    `can't find ${req.originalUrl} on this server`,
    404
  );
  next(error);
};

export default notFoundMiddleWare;
