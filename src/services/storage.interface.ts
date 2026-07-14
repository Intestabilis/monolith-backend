export type UploadContext = {
  folderPath: string;
  fileId?: string;
  tags?: string[];
};

export interface IStorageService {
  uploadImage: (
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
    context: UploadContext,
  ) => Promise<string>;
  deleteImage: (fileUrl: string) => Promise<void>;
  deleteByTag: (tag: string) => Promise<void>;
  deleteFolder: (folderPath: string) => Promise<void>;
}
