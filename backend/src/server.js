import express from "express";
import "express-async-errors";
import { config } from "dotenv";
import { validate } from "./config/env.js";
import { connectDB, disconnectDB } from "./config/db.js";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

// Import Routes
import authRoutes from "./routes/authRoutes.js";
import favoritesRoutes from "./routes/readerRoutes/favoriteRoutes.js";
// import crudBook from "./routes/adminRoutes/crudBooks.js"
import crudReader from "./routes/adminRoutes/crudReader.js";
import updatePasswordRoute from "./routes/updatePasswordRoute.js";
import auditLogsRoutes from "./routes/adminRoutes/auditLogs.js";
import devRoutes from "./routes/devRoutes.js";

config();
validate();
connectDB();

const app = express();

// safety middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || [],
    credentials: true,
  }),
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
  }),
);

// Body parsing middlwares
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: "ok",
    },
  });
});
// API Routes
/*
except for the authRoutes, each of the other request requires the client to send 
the jwt token
the jwt would be used to carry out role dependent functions (authorisation?) (like only an ADMIN can CRUD users)
- the jwt would also be used to check if a valid user (who is logged in) is making the requests (authentication?)
*/

app.use("/auth", authRoutes);
app.use("/reader/favorites", favoritesRoutes);
app.use("/admin/manage/reader", crudReader);
app.use("/admin/manage/", crudReader);
app.use("/manage", updatePasswordRoute);
app.use("/manage", auditLogsRoutes);
app.use("/dev", devRoutes);
// app.use("/admin/manage/book", crudBook);
app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(process.env.PORT || 5001, "0.0.0.0", () => {
  console.log(`Server running on PORT ${process.env.PORT}`);
});

/*
below three function calls are for handling 3 different situations 
that could lead to us disconnecting the DB
*/

// process.on({eventHappening in the system}, callbackFunc)

// Handle unhandled promise rejections (e.g., database connection errors)
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  server.close(async () => {
    await disconnectDB();
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", async (err) => {
  console.error("Uncaught Exception:", err);
  await disconnectDB();
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
});
