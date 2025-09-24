import cookieParser from "cookie-parser";
import cors from "cors";
import csrf from "csurf";
import dotenv from "dotenv";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoose from "mongoose";
import errorMiddleware from "./middlewares/error.js";
import notFoundMiddleWare from "./middlewares/notfound.js";
import {
  authRouter,
  cartRouter,
  checkoutRouter,
  orderRoutes,
  productsRouter,
  profileRoute,
  userRouter,
} from "./store.routes.js";
import { PORT as DeclaredPort } from "./utils/variables.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || DeclaredPort || 5000;

const sanitizeMongoData = (req, res, next) => {
  if (req.body) {
    const sanitize = (obj) => {
      for (let key in obj) {
        if (typeof obj[key] === "string") {
          if (key.startsWith("$") || obj[key].startsWith("$")) {
            delete obj[key];
          }
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
          sanitize(obj[key]);
        }
      }
    };
    sanitize(req.body);
  }

  if (req.query) {
    const sanitizedQuery = {};
    for (let key in req.query) {
      if (!key.startsWith("$")) {
        sanitizedQuery[key] = req.query[key];
      }
    }
    req.sanitizedQuery = sanitizedQuery;
  }

  next();
};

// Security Middlewares
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

app.use(sanitizeMongoData);
app.use(cookieParser());

// Rate Limiting - Different limits for production
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 100 : 1000,
  message: "Too many requests from this IP, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

// CORS setup for production
const corsOptions = {
  origin: process.env.NODE_ENV === "production" 
    ? process.env.CLIENT_URL 
    : ["http://localhost:3000", "http://localhost:5173"],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));


// CSRF protection - disable for API routes that need to work with external services
const csrfProtection = csrf({
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  },
});

// Webhook must come BEFORE express.json()
app.use("/api/checkout/webhook", express.raw({ type: "application/json" }));

// JSON middleware for other routes
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check route
app.get("/", (req, res) => {
  res.json({
    message: "E-Commerce API is running!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    database:
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/users", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRoutes);
app.use("/api/checkout", checkoutRouter);
app.use("/api", profileRoute);

// Apply CSRF only to routes that need it (avoid for webhooks, APIs consumed by mobile apps, etc.)
app.post("/api/secure-action", csrfProtection, (req, res) => {
  res.json({ message: "Secure action completed!" });
});
app.get("/api/csrf-token", csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Route not found
app.use(notFoundMiddleWare);
// Global error handler
app.use(errorMiddleware);

// DB connection with better error handling
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error(" DB Connection Error:", error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Received SIGINT. Closing server gracefully...");
  await mongoose.connection.close();
  process.exit(0);
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
