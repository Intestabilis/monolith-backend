import { Router } from "express";
import { CreateUserSchema, LoginUserSchema } from "../schemas/user.schema.js";
import validate from "express-zod-safe";
import z from "zod";

import authMiddleware from "../middlewares/auth-middleware.js";
import { requireCampaignRole } from "../middlewares/campaign-role-middleware.js";
import {
  getCampaignContent,
  getCampaignContext,
  getUserCampaigns,
  getUserMasterCampaigns,
  getUserPlayerCampaigns,
} from "../controllers/campaign-controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/my-campaigns", getUserCampaigns);
router.get("/my-campaigns/player", getUserPlayerCampaigns);
router.get("/my-campaigns/master", getUserMasterCampaigns);

router.get(
  "/:id/context",
  requireCampaignRole(["master", "player"]),
  getCampaignContext,
);

router.get(
  "/:id/content",
  requireCampaignRole(["master", "player"]),
  getCampaignContent,
);

// router.patch(
//   "/:id",
//   requireCampaignRole(["master"]),
//   /* CampaignController.updateCampaign */ (req, res) => res.json({ ok: true }),
// );

export default router;
