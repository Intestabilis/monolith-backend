import type { Request, Response, NextFunction } from "express";
import campaignService from "../services/campaign-service.js";
import type { CampaignRole } from "../schemas/campaign.schema.js";

export async function getUserCampaigns(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await campaignService.getUserAllCampaigns(req.user!.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getUserPlayerCampaigns(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await campaignService.getUserPlayerCampaigns(req.user!.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
export async function getUserMasterCampaigns(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const result = await campaignService.getUserMasterCampaigns(req.user!.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getCampaignContext(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    // REVIEW I don't quite like type assertion there
    const role = req.campaignRole as CampaignRole;
    const result = await campaignService.getCampaignContext(id as string, role);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function getCampaignContent(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    // REVIEW I don't quite like type assertion there
    const result = await campaignService.getCampaignContent(id as string);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
