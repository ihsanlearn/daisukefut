import apiClient from "./client";

export const uploadApi = {
  uploadImage: async (file: File, folder: string): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const { data } = await apiClient.post("/v1/auth/upload/image", formData);
    return data;
  },
};
