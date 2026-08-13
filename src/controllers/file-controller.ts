import type { Request, Response, NextFunction } from "express";
import CloudinaryStorageService from "../services/storage-service.js";
import BadRequestError from "../exceptions/bad-request.js";
import userService from "../services/user-service.js";

const fileController = {
  uploadCampaignEditorImage: async function (
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
  },

  uploadAvatar: async function (
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const user = req.user;
      const file = req.file;

      // similar to other user checks - reduntant due to already existing auth middleware, but to satisfy typescript and don't do elaborate request type
      if (!user) throw new BadRequestError("Not authorized");

      if (!file) throw new BadRequestError("У запиті немає зображення!");

      const imageUrl = await CloudinaryStorageService.uploadImage(
        file.buffer,
        file.originalname,
        file.mimetype,
        {
          folderPath: `users/${user.id}`,
          fileId: "avatar",
          tags: [`user_${user.id}`, "avatar"],
        },
      );

      const updatedProfile = await userService.updateUserAvatar(
        user.id,
        imageUrl,
      );

      console.log(updatedProfile);
      return res.json(updatedProfile);
    } catch (err) {
      next(err);
    }
  },
};

export default fileController;
