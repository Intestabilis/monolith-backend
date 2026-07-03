import multer from "multer";
import BadRequestError from "../exceptions/bad-request.js";

const storage = multer.memoryStorage();

const DEFAULT_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function createUploader(
  maxSizeMB: number,
  allowedTypes: string[] = DEFAULT_IMAGE_TYPES,
) {
  return multer({
    storage,
    limits: {
      fileSize: maxSizeMB * 1024 * 1024,
    },
    // REVIEW add types for parameters(? not sure about it because i think multer types kinda handles it)
    fileFilter: (req, file, cb) => {
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        // REVIEW needs to re-check docs, if I understand correctly that'll give us default error flow to error middleware, but if not should check docs better
        cb(new BadRequestError("Invalid file type!"));
      }
    },
  });
}

export const uploadAvatar = createUploader(2);
export const uploadCampaignCover = createUploader(4);
export const uploadEditorImage = createUploader(2);
