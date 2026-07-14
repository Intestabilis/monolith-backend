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
  updateCampaignContent,
  uploadCover,
} from "../controllers/campaign-controller.js";
import {
  CreateCampaignSchema,
  UpdateCampaignContentSchema,
  UpdateCampaignSchema,
} from "../schemas/campaign.schema.js";
import { uploadCampaignCover } from "../middlewares/upload-middleware.js";
import partyRouter from "./party.js";
import { joinCampaign } from "../controllers/party-controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/my-campaigns", getUserCampaigns);
router.get("/my-campaigns/player", getUserPlayerCampaigns);
router.get("/my-campaigns/master", getUserMasterCampaigns);

router.post("/", validate({ body: CreateCampaignSchema }), createCampaign);

router.get(
  "/:id/context",
  requireCampaignRole(["master", "player"]),
  validate({ params: { id: z.uuid() } }),
  getCampaignContext,
);

router.get(
  "/:id/content",
  requireCampaignRole(["master", "player"]),
  validate({ params: { id: z.uuid() } }),
  getCampaignContent,
);

// CHANGE add files validation with zod
router.post(
  "/:id/cover",
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

router.patch(
  "/:id/content",
  requireCampaignRole(["master"]),
  validate({ params: { id: z.uuid() }, body: UpdateCampaignContentSchema }),
  updateCampaignContent,
);

router.delete("/:id", requireCampaignRole(["master"]), deleteCampaign);

// PARTY ROUTER (and functionality)

router.post(
  "/join/:token",
  validate({ params: { token: z.uuid() } }),
  joinCampaign,
);

router.use("/:id/party", partyRouter);

export default router;
