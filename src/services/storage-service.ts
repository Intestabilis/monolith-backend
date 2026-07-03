import { v2 as cloudinary } from "cloudinary";
import type { IStorageService, UploadContext } from "./storage.interface.js";

// REVIEW type assessment
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
});

const CloudinaryStorageService: IStorageService = {
  uploadImage: async function (
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
    context: UploadContext,
  ): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const publicId =
        context.folder === "editor" ? crypto.randomUUID() : context.entityId;

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `monolith/${context.folder}`,
          public_id: publicId,
          overwrite: context.folder !== "editor", // true if it's entity image like campaign cover/profile picture etc
          resource_type: "image",
        },
        (error, result) => {
          if (error || !result) return reject(error);
          // return image url
          resolve(result.secure_url);
        },
      );
      uploadStream.end(fileBuffer);
    });
  },
  deleteImage: async function (fileUrl: string): Promise<void> {
    try {
      const urlParts = fileUrl.split("/");
      const fileNameWithExt = urlParts[urlParts.length - 1];
      const folder = urlParts[urlParts.length - 2];
      const publicId = `monolith/${folder}/${fileNameWithExt!.split(".")[0]}`;

      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      console.log("Error deleting image from Cloudinary: ", err);
    }
  },
};

export default CloudinaryStorageService;
