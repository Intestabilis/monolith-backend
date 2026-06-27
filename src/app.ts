import "reflect-metadata";
import express from "express";
import "dotenv/config";
import { AppDataSource } from "./data-source.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routes/auth.js";
import userRouter from "./routes/users.js";
import errorMiddleware from "./middlewares/error-middleware.js";

try {
  await AppDataSource.initialize();
} catch (error) {
  console.log(error);
}

const port = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: "GET,POST,PUT,DELETE",
  }),
);

// routes
app.use("/auth", authRouter);
app.use("/users", userRouter);

app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Server has started on ${port}`);
});
