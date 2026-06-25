import "reflect-metadata";
import express from "express";
import "dotenv/config";
import { AppDataSource } from "./data-source.js";
import cookieParser from "cookie-parser";
import cors from "cors";

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
    methods: "GET,POST,PUT,DELETE",
  }),
);

// routes
// app.use("/auth" /* authRouter */);

app.listen(port, () => {
  console.log(`Server has started on ${port}`);
});
