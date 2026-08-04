type SafeProgressUpdateArgs = {
  entity: 'import' | 'export';
  id: string;
  subdomain: string;
  stage: string;
  update: () => Promise<any>;
};

export const safeProgressUpdate = async ({
  entity,
  id,
  subdomain,
  stage,
  update,
}: SafeProgressUpdateArgs): Promise<void> => {
  try {
    await update();
  } catch (error: any) {
    console.error(
      `[ImportExport] Failed to update ${entity} progress at stage "${stage}" for ${subdomain}/${id}: ${
        error?.message || 'Unknown error'
      }`,
    );
  }
};
