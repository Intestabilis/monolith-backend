import { Router } from "express";
import authMiddleware from "../middlewares/auth-middleware.js";
import { requireCampaignRole } from "../middlewares/campaign-role-middleware.js";
import { uploadEditorImage } from "../middlewares/upload-middleware.js";
import validate from "express-zod-safe";
import z from "zod";
import fileController from "../controllers/file-controller.js";

const router = Router();

router.use(authMiddleware);

// editor image for campaign
// REVIEW add image validation with zod? not sure about that
router.post(
  "/:campaignId/editor/image",
  requireCampaignRole(["master"], "campaignId"),
  validate({ params: { campaignId: z.uuid() } }),
  uploadEditorImage.single("image"),
  fileController.uploadCampaignEditorImage,
);

export default router;
