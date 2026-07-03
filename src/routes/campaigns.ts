import { Router } from "express";
import validate from "express-zod-safe";
import z from "zod";
import authMiddleware from "../middlewares/auth-middleware.js";
import { requireCampaignRole } from "../middlewares/campaign-role-middleware.js";
import {
  createCampaign,
  deleteCampaign,
  getCampaignContent,
  getCampaignContext,
  getUserCampaigns,
  getUserMasterCampaigns,
  getUserPlayerCampaigns,
  updateCampaign,
  uploadCover,
} from "../controllers/campaign-controller.js";
import {
  CreateCampaignSchema,
  UpdateCampaignSchema,
} from "../schemas/campaign.schema.js";
import { uploadCampaignCover } from "../middlewares/upload-middleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/my-campaigns", getUserCampaigns);
router.get("/my-campaigns/player", getUserPlayerCampaigns);
router.get("/my-campaigns/master", getUserMasterCampaigns);

router.post("/", validate({ body: CreateCampaignSchema }), createCampaign);

router.get(
  "/:id/context",
  validate({ params: { id: z.uuid() } }),
  requireCampaignRole(["master", "player"]),
  getCampaignContext,
);

router.get(
  "/:id/content",
  validate({ params: { id: z.uuid() } }),
  requireCampaignRole(["master", "player"]),
  getCampaignContent,
);

// CHANGE add files validation with zod
router.post(
  "/:id/cover",
  authMiddleware,
  requireCampaignRole(["master"]),
  uploadCampaignCover.single("image"),
  uploadCover,
);

router.patch(
  "/:id",
  requireCampaignRole(["master"]),
  validate({ params: { id: z.uuid() }, body: UpdateCampaignSchema }),
  updateCampaign,
);

router.delete("/:id", requireCampaignRole(["master"]), deleteCampaign);

export default router;
