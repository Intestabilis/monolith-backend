import { Router } from "express";
import authMiddleware from "../middlewares/auth-middleware.js";
import { requireCampaignRole } from "../middlewares/campaign-role-middleware.js";
import {
  uploadAvatar,
  uploadEditorImage,
} from "../middlewares/upload-middleware.js";
import validate from "express-zod-safe";
import z from "zod";
import fileController from "../controllers/file-controller.js";
import activationMiddleware from "../middlewares/activation-middleware.js";

const router = Router();

router.use(authMiddleware);
router.use(activationMiddleware);
// editor image for campaign
// REVIEW add image validation with zod? not sure about that
router.post(
  "/:campaignId/editor/image",
  requireCampaignRole(["master"], "campaignId"),
  validate({ params: { campaignId: z.uuid() } }),
  uploadEditorImage.single("image"),
  fileController.uploadCampaignEditorImage,
);

router.post(
  "/me/avatar",
  authMiddleware,
  uploadAvatar.single("image"),
  fileController.uploadAvatar,
);

export default router;
