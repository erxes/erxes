export interface ImportJobData {
  subdomain: string;
  data: {
    importId: string;
    entityType: string;
    fileKey: string;
  };
}

