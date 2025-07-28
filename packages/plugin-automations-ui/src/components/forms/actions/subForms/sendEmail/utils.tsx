export const getContentType = (triggerType: string) => {
  const [contentType] = triggerType.split('.');
  return contentType;
};

export const checkToFieldConfigured = (emailRecipientsConst, config) => {
  const keys = emailRecipientsConst.map(({ name }) => name);
  const configKeys = Object.keys(config);

  return keys.some((key) =>
    Array.isArray(config[key])
      ? (config[key] || [])?.length
      : config[key] && configKeys.includes(key)
  );
};
