export type Company = {
  id: string;
  name: string;
  owner_id: string;
  r2_path: string;
  created_at: string;
};

export type FileRecord = {
  id: string;
  company_id: string;
  file_name: string;
  file_key: string;
  file_type: string;
  size: number;
  uploaded_by: string;
  created_at: string;
};

export const ACCEPTED_FILE_TYPES: Record<string, string> = {
  "application/pdf": ".pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
  "image/png": ".png",
  "image/jpeg": ".jpg",
};

export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB
