import type { Request, Response, NextFunction } from "express";
import CloudinaryStorageService from "../services/storage-service.js";
import BadRequestError from "../exceptions/bad-request.js";

export async function uploadCampaignEditorImage(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { campaignId } = req.params;
    const file = req.file;

    if (!file) {
      throw new BadRequestError("There is no image in request!");
    }

    const imageUrl = await CloudinaryStorageService.uploadImage(
      file.buffer,
      file.originalname,
      file.mimetype,
      {
        folderPath: `campaigns/${campaignId}/editor`,
        tags: [`campaign_${campaignId}`],
      },
    );

    return res.json(imageUrl);
  } catch (err) {
    next(err);
  }
}
