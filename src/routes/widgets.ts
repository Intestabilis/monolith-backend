import { Router } from "express";
import widgetController from "../controllers/widget-controller.js";
import { requireCampaignRole } from "../middlewares/campaign-role-middleware.js";
import authMiddleware from "../middlewares/auth-middleware.js";
import z from "zod";
import validate from "express-zod-safe";
import {
  createWidgetSchema,
  updateWidgetContentSchema,
  updateWidgetsLayoutSchema,
} from "../schemas/widget.schema.js";

const router = Router({ mergeParams: true });

// authMiddleware there just in case of changing campaigns router in the future (now campaign already do it by default for all routes,
// but if I would add some public routes I can change it)

router.use(authMiddleware);
router.use(requireCampaignRole(["master"], "campaignId"));

// validation schemas
const campaignParamSchema = z.object({
  campaignId: z.uuid("Invalid campaign ID format"),
});

const widgetParamSchema = campaignParamSchema.extend({
  widgetId: z.uuid("Invalid quest ID format"),
});

router.get(
  "/",
  validate({ params: campaignParamSchema }),
  widgetController.getWidgets,
);
router.post(
  "/",
  validate({ params: campaignParamSchema, body: createWidgetSchema }),
  widgetController.createWidget,
);
router.delete(
  "/:widgetId",
  validate({ params: widgetParamSchema }),
  widgetController.deleteWidget,
);

router.patch(
  "/layout",
  validate({ params: campaignParamSchema, body: updateWidgetsLayoutSchema }),
  widgetController.updateLayout,
);
router.patch(
  "/:widgetId",
  validate({ params: widgetParamSchema, body: updateWidgetContentSchema }),
  widgetController.updateContent,
);

export default router;
