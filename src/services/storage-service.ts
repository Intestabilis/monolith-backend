import { v2 as cloudinary } from "cloudinary";
import type { IStorageService, UploadContext } from "./storage.interface.js";

const deleteEmptyFolders = async (currentPath: string) => {
  const { folders } = await cloudinary.api
    .sub_folders(currentPath)
    .catch(() => ({ folders: [] }));

  for (const subFolder of folders) {
    await deleteEmptyFolders(subFolder.path);
  }

  await cloudinary.api.delete_folder(currentPath).catch(() => null);
};

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
      const publicId = context.fileId || crypto.randomUUID();

      const overwrite = !!context.fileId;

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `monolith/${context.folderPath}/`,
          public_id: publicId,
          overwrite,
          resource_type: "image",
          tags: context.tags || [],
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
      // upload in cloudinary URL's
      const uploadIndex = urlParts.findIndex((part) => part === "upload");
      if (uploadIndex === -1) return;
      // 2 because next part in the URL is v****** also by cloudinary
      const pathWithExtension = urlParts.slice(uploadIndex + 2).join("/");
      const publicId = pathWithExtension.replace(/\.[^/.]+$/, "");

      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      console.log("Error deleting image from Cloudinary: ", err);
    }
  },

  deleteByTag: async function (tag: string): Promise<void> {
    try {
      await cloudinary.api.delete_resources_by_tag(tag);
      // pause for cloudinary to reflect changes with deleted resources
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (err) {
      console.error(`Error deleting resources with tag ${tag}:`, err);
      throw err;
    }
  },

  deleteFolder: async function (folderPath: string): Promise<void> {
    try {
      const fullPath = `monolith/${folderPath}/`;
      await deleteEmptyFolders(fullPath);
      console.log(`Folder ${folderPath} deleted successfully`);
    } catch (err) {
      console.log(`Error deleting folder ${folderPath}: `, err);
    }
  },
};

export default CloudinaryStorageService;
