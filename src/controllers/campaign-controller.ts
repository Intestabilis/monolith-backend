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

export async function createCampaign(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id: userId } = req.user!;

    const campaignData = req.body;

    const campaign = await campaignService.createCampaign(userId, campaignData);
    res.status(201).json(campaign);
  } catch (err) {
    next(err);
  }
}
export async function updateCampaign(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const campaignData = req.body;
    console.log(id);
    // REVIEW once again type assertion
    const campaign = await campaignService.updateCampaign(
      id as string,
      campaignData,
    );
    res.json(campaign);
  } catch (err) {
    next(err);
  }
}
export async function deleteCampaign(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    // REVIEW guess what type assertion
    await campaignService.deleteCampaign(id as string);
    res.status(204).end();
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
