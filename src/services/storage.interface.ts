export type UploadContext =
  | { folder: "campaigns"; entityId: string }
  | { folder: "users"; entityId: string }
  | { folder: "editor" };

export interface IStorageService {
  uploadImage(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
    context: UploadContext,
  ): Promise<string>;
  deleteImage(fileUrl: string): Promise<void>;
}
