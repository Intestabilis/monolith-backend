import { Router } from "express";
import { UpdateProfileSchema } from "../schemas/user.schema.js";
import validate from "express-zod-safe";
import userController from "../controllers/user-controller.js";
import authMiddleware from "../middlewares/auth-middleware.js";

const router = Router();

router.get("/me", authMiddleware, userController.getUserProfile);

router.patch(
  "/me",
  authMiddleware,
  validate({ body: UpdateProfileSchema }),
  userController.updateUserProfile,
);

export default router;
