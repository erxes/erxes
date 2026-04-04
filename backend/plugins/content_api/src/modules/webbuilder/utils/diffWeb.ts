const TRACKED_FIELDS = [
    'name',
    'clientPortalId',
    'description',
    'domain',
    'copyright',
    'templateId',
    'templateType',
    'keywords',
    'appearances',
    'integrations',
    'environmentVariables',
    'externalLinks',
  ];
  
  export const diffWeb = (
    oldDoc: Record<string, any>,
    newDoc: Record<string, any>,
  ) => {
    const changes: { field: string; from: any; to: any }[] = [];
  
    for (const field of TRACKED_FIELDS) {
      const from = JSON.stringify(oldDoc[field] ?? null);
      const to = JSON.stringify(newDoc[field] ?? null);
      if (from !== to) {
        changes.push({
          field,
          from: oldDoc[field] ?? null,
          to: newDoc[field] ?? null,
        });
      }
    }
  
    return changes;
  };