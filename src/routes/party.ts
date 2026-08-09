import { Router } from "express";
import authMiddleware from "../middlewares/auth-middleware.js";
import { requireCampaignRole } from "../middlewares/campaign-role-middleware.js";
import validate from "express-zod-safe";
import z from "zod";
import partyController from "../controllers/party-controller.js";
import activationMiddleware from "../middlewares/activation-middleware.js";

// CHANGE move it somewhere, can't decide where (doesn't feel right to create type file for just this schema)
const CreateInviteSchema = z.object({
  duration: z.enum(["7d", "30d"]),
});

const router = Router({ mergeParams: true });

router.use(authMiddleware);
router.use(activationMiddleware);

router.get(
  "/",
  requireCampaignRole(["master", "player"]),
  validate({ params: { id: z.uuid() } }),
  partyController.getCampaignParty,
);

router.post(
  "/invites",
  requireCampaignRole(["master"]),
  validate({ params: { id: z.uuid() }, body: CreateInviteSchema }),
  partyController.createCampaignInvite,
);

router.delete(
  "/:userId",
  requireCampaignRole(["master"]),
  validate({
    params: { id: z.uuid(), userId: z.uuid() },
  }),
  partyController.removeCampaignMember,
);

export default router;
