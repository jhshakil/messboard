import { imagekit } from "@/lib/imagekit";
import { v4 as uuidv4 } from "uuid";

export const imagekitService = {
  uploadImage: async (file: File, folder = "cleaning"): Promise<string> => {
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop();
    const filename = `${folder}/${uuidv4()}.${ext}`;

    const result = await imagekit.upload({
      file: buffer,
      fileName: filename,
      folder: `/messboard/${folder}`,
    });

    return result.url;
  },

  deleteImage: async (url: string): Promise<void> => {
    try {
      const response = await imagekit.listFiles({ searchQuery: `url="${url}"` });
      const file = response[0] as { fileId: string } | undefined;
      if (file?.fileId) {
        await imagekit.deleteFile(file.fileId);
      }
    } catch {}
  },

  uploadMultiple: async (files: File[], folder = "cleaning"): Promise<string[]> => {
    return Promise.all(files.map((f) => imagekitService.uploadImage(f, folder)));
  },
};
