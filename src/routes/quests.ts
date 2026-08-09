// src/features/quests/quests.routes.ts

import { Router } from "express";
import validate from "express-zod-safe";
import z from "zod";
import questController from "../controllers/quest-controller.js";
import { requireCampaignRole } from "../middlewares/campaign-role-middleware.js";
import {
  createQuestSchema,
  updateQuestSchema,
  createCategorySchema,
  updateCategorySchema,
  reorderItemsSchema,
} from "../schemas/quest.schema.js";
import authMiddleware from "../middlewares/auth-middleware.js";
import activationMiddleware from "../middlewares/activation-middleware.js";

const router = Router({ mergeParams: true });

router.use(authMiddleware);
router.use(activationMiddleware);

// validation schemas
const campaignParamSchema = z.object({
  campaignId: z.uuid("Invalid campaign ID format"),
});

const questParamSchema = campaignParamSchema.extend({
  questId: z.uuid("Invalid quest ID format"),
});

const categoryParamSchema = campaignParamSchema.extend({
  categoryId: z.uuid("Invalid category ID format"),
});

// get endpoints

router.get(
  "/quest-tree",
  requireCampaignRole(["master", "player"], "campaignId"),
  validate({ params: campaignParamSchema }),
  questController.getQuestTree,
);

router.get(
  "/:questId",
  requireCampaignRole(["master", "player"], "campaignId"),
  validate({ params: questParamSchema }),
  questController.getQuestById,
);

// quests

router.post(
  "/",
  requireCampaignRole(["master"], "campaignId"),
  validate({ params: campaignParamSchema, body: createQuestSchema }),
  questController.createQuest,
);

router.patch(
  "/:questId",
  requireCampaignRole(["master"], "campaignId"),
  validate({ params: questParamSchema, body: updateQuestSchema }),
  questController.updateQuest,
);

router.delete(
  "/:questId",
  requireCampaignRole(["master"], "campaignId"),
  validate({ params: questParamSchema }),
  questController.deleteQuest,
);

// categories

router.post(
  "/categories",
  requireCampaignRole(["master"], "campaignId"),
  validate({ params: campaignParamSchema, body: createCategorySchema }),
  questController.createCategory,
);

router.patch(
  "/categories/:categoryId",
  requireCampaignRole(["master"], "campaignId"),
  validate({ params: categoryParamSchema, body: updateCategorySchema }),
  questController.updateCategory,
);

router.delete(
  "/categories/:categoryId",
  requireCampaignRole(["master"], "campaignId"),
  validate({ params: categoryParamSchema }),
  questController.deleteCategory,
);

// reorder

router.patch(
  "/reorder/items",
  requireCampaignRole(["master"], "campaignId"),
  validate({ params: campaignParamSchema, body: reorderItemsSchema }),
  questController.reorderItems,
);

export default router;
