import { Router } from "express";
import validate from "express-zod-safe";
import z from "zod";
import authMiddleware from "../middlewares/auth-middleware.js";
import { requireCampaignRole } from "../middlewares/campaign-role-middleware.js";
import campaignController from "../controllers/campaign-controller.js";
import {
  CreateCampaignSchema,
  UpdateCampaignContentSchema,
  UpdateCampaignSchema,
} from "../schemas/campaign.schema.js";
import { uploadCampaignCover } from "../middlewares/upload-middleware.js";
import partyRouter from "./party.js";
import questRouter from "./quests.js";
import partyController from "../controllers/party-controller.js";
import widgetRouter from "./widgets.js";

const router = Router();

router.use(authMiddleware);

router.get("/my-campaigns", campaignController.getUserCampaigns);
router.get("/my-campaigns/player", campaignController.getUserPlayerCampaigns);
router.get("/my-campaigns/master", campaignController.getUserMasterCampaigns);

router.post(
  "/",
  validate({ body: CreateCampaignSchema }),
  campaignController.createCampaign,
);

router.get(
  "/:id/context",
  requireCampaignRole(["master", "player"]),
  validate({ params: { id: z.uuid() } }),
  campaignController.getCampaignContext,
);

router.get(
  "/:id/content",
  requireCampaignRole(["master", "player"]),
  validate({ params: { id: z.uuid() } }),
  campaignController.getCampaignContent,
);

// CHANGE add files validation with zod
router.post(
  "/:id/cover",
  requireCampaignRole(["master"]),
  uploadCampaignCover.single("image"),
  campaignController.uploadCover,
);

router.patch(
  "/:id",
  requireCampaignRole(["master"]),
  validate({ params: { id: z.uuid() }, body: UpdateCampaignSchema }),
  campaignController.updateCampaign,
);

router.patch(
  "/:id/content",
  requireCampaignRole(["master"]),
  validate({ params: { id: z.uuid() }, body: UpdateCampaignContentSchema }),
  campaignController.updateCampaignContent,
);

router.delete(
  "/:id",
  requireCampaignRole(["master"]),
  campaignController.deleteCampaign,
);

// PARTY ROUTER (and functionality)

router.post(
  "/join/:token",
  validate({ params: { token: z.uuid() } }),
  partyController.joinCampaign,
);

router.use("/:id/party", partyRouter);

// QUESTS ROUTER

router.use("/:campaignId/quests", questRouter);

// DMSCREEN WIDGETS ROUTER

router.use("/:campaignId/widgets", widgetRouter);

export default router;
