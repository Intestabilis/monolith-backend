import { Router } from "express";
import { CreateUserSchema, LoginUserSchema } from "../schemas/user.schema.js";
import validate from "express-zod-safe";
import z from "zod";

import {
  register,
  login,
  logout,
  activate,
  refresh,
  getStatus,
} from "../controllers/auth-controller.js";
import authMiddleware from "../middlewares/auth-middleware.js";

const router = Router();

router.post("/register", validate({ body: CreateUserSchema }), register);

router.post("/login", validate({ body: LoginUserSchema }), login);
// maybe create some custom validation for cookies later since token in it
router.post("/logout", logout);
router.post(
  "/activate/:link",
  validate({ params: { link: z.string() } }),
  activate,
);
router.get("/refresh", refresh);

router.get("/status", authMiddleware, getStatus);

export default router;
