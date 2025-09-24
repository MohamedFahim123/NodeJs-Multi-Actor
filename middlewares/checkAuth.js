import jwt from "jsonwebtoken";
import AppError from "../utils/appError.js";
import catchAsync from "../utils/catchAsync.js";

const blacklistedTokens = new Set();

export const addToBlacklist = (token) => {
  blacklistedTokens.add(token);
};

export const decodeAndPutUserInRequestObj = async (token, req, res, next) => {
  try {
    if (blacklistedTokens.has(token)) {
      return next(
        new AppError("Token is invalid or expired. Please login again", 401)
      );
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    req.user = decoded;
    next();
  } catch (error) {
    return next(new AppError("Invalid or expired token", 401));
  }
};

const checkAuth = catchAsync(async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return next(new AppError("You must login first!", 401));
  }

  let token = authorization;
  if (token.startsWith("Bearer ")) {
    token = token.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("Authentication token missing", 401));
  }

  await decodeAndPutUserInRequestObj(token, req, res, next);
});

const checkIsAuthorized = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You don't have permission to do this action", 403)
      );
    }

    next();
  };
};

export {  checkAuth, checkIsAuthorized };

