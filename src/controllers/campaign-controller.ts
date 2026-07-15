import type { Request, Response, NextFunction } from "express";
import campaignService from "../services/campaign-service.js";
import type { CampaignRole } from "../schemas/campaign.schema.js";
import BadRequestError from "../exceptions/bad-request.js";
import CloudinaryStorageService from "../services/storage-service.js";

const campaignController = {
  getUserCampaigns: async function (
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
  },
  getUserPlayerCampaigns: async function (
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
  },
  getUserMasterCampaigns: async function (
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
  },
  createCampaign: async function (
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id: userId } = req.user!;

      const campaignData = req.body;

      const campaign = await campaignService.createCampaign(
        userId,
        campaignData,
      );
      res.status(201).json(campaign);
    } catch (err) {
      next(err);
    }
  },
  updateCampaign: async function (
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id } = req.params;
      const campaignData = req.body;
      // REVIEW once again type assertion
      const campaign = await campaignService.updateCampaign(
        id as string,
        campaignData,
      );
      res.json(campaign);
    } catch (err) {
      next(err);
    }
  },
  updateCampaignContent: async function (
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id } = req.params;
      const campaignData = req.body;
      console.log("TESTTESTTEST");
      console.log("BODYYY ", campaignData);
      // REVIEW once again type assertion
      const campaign = await campaignService.updateCampaignContent(
        id as string,
        campaignData,
      );
      res.json(campaign);
    } catch (err) {
      next(err);
    }
  },
  deleteCampaign: async function (
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
  },
  getCampaignContext: async function (
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id } = req.params;
      // REVIEW I don't quite like type assertion there
      const role = req.campaignRole as CampaignRole;
      const result = await campaignService.getCampaignContext(
        id as string,
        role,
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
  getCampaignContent: async function (
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
  },
  uploadCover: async function (
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id } = req.params;
      const file = req.file;

      if (!file) {
        throw new BadRequestError("There is no image in request!");
      }

      const imageUrl = await CloudinaryStorageService.uploadImage(
        file.buffer,
        file.originalname,
        file.mimetype,
        // REVIEW fileId change
        {
          folderPath: `campaigns/${id}`,
          fileId: "cover",
          tags: [`campaign_${id}`],
        },
      );

      // REVIEW lowkey stinks (and maybe should divide update method in different methods like updateTitle, updateContent etc at all), but will do for now
      const updatedCampaign = await campaignService.updateCampaign(
        id as string,
        {
          imageUrl: imageUrl,
        },
      );

      return res.json(updatedCampaign);
    } catch (err) {
      next(err);
    }
  },
};

export default campaignController;
