import type { Request, Response, NextFunction } from "express";
import partyService from "../services/party-service.js";

export async function createCampaignInvite(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const campaignId = req.params.id;
    const { duration } = req.body;

    const token = await partyService.generateInvite(
      campaignId as string,
      duration,
    );

    const inviteUrl = `${process.env.CLIENT_URL}/join/${token}`;

    res.status(201).json({ inviteUrl, token });
  } catch (error) {
    next(error);
  }
}

export async function joinCampaign(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const inviteToken = req.params.token;
    const userId = req.user!.id;

    const campaignId = await partyService.joinCampaign(
      inviteToken as string,
      userId,
    );

    res.status(200).json({
      message: "Successfully joined campaign!",
      campaignId,
    });
  } catch (error) {
    next(error);
  }
}

export async function getCampaignParty(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const campaignId = req.params.id;
    const party = await partyService.getPartyMembers(campaignId as string);

    res.status(200).json(party);
  } catch (error) {
    next(error);
  }
}

export async function removeCampaignMember(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const campaignId = req.params.id;
    const kickUserId = req.params.userId;

    await partyService.removeMember(campaignId as string, kickUserId as string);

    res.status(200).json({ message: "Player was successfully removed" });
  } catch (error) {
    next(error);
  }
}
