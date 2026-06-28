import type { Request, Response, NextFunction } from "express";
import UnauthorizedError from "../exceptions/unauthorized.js";
import campaignService from "../services/campaign-service.js";
import UnauthenticatedError from "../exceptions/unauthenticated.js";
import type { CampaignRole } from "../schemas/campaign.schema.js";
import BadRequestError from "../exceptions/bad-request.js";

export function requireCampaignRole(
  allowedRoles: CampaignRole[],
  paramName = "id",
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthenticatedError("You are not logged in");
      }

      const userId = req.user.id;

      // CHANGE do validation in routes or check for string only somewhere else idk
      const campaignId = req.params[paramName] as string;

      if (!campaignId) {
        throw new BadRequestError("Campaign id is missing in the route");
      }

      const role = await campaignService.getUserRole(userId, campaignId);

      if (!role) {
        throw new UnauthorizedError("You do not have access to this campaign");
      }

      if (!allowedRoles.includes(role)) {
        throw new UnauthorizedError(
          `Access forbidden: requires one of this roles: ${allowedRoles.join(", ")}`,
        );
      }

      req.campaignRole = role;

      next();
    } catch (err) {
      next(err);
    }
  };
}
