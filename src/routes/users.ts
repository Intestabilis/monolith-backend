import { Router } from "express";
import { CreateUserSchema, LoginUserSchema } from "../schemas/user.schema.js";
import validate from "express-zod-safe";
import z from "zod";
import userController from "../controllers/user-controller.js";
import authMiddleware from "../middlewares/auth-middleware.js";

const router = Router();

router.get("/me", authMiddleware, userController.getUser);

export default router;
