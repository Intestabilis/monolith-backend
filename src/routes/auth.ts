import { Router } from "express";
import { CreateUserSchema, LoginUserSchema } from "../schemas/user.schema.js";
import validate from "express-zod-safe";
import z from "zod";

import authController from "../controllers/auth-controller.js";
import authMiddleware from "../middlewares/auth-middleware.js";

const router = Router();

router.post(
  "/register",
  validate({ body: CreateUserSchema }),
  authController.register,
);

router.post(
  "/login",
  validate({ body: LoginUserSchema }),
  authController.login,
);
// maybe create some custom validation for cookies later since token in it
router.post("/logout", authController.logout);

router.post(
  "/activate/:link",
  validate({ params: { link: z.string() } }),
  authController.activate,
);

router.post(
  "/resend-activation",
  authMiddleware,
  authController.resendActivation,
);

router.get("/refresh", authController.refresh);

router.get("/status", authMiddleware, authController.getStatus);

export default router;
