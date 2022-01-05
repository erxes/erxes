const updateCustomFieldsCache = ({
  id,
  type,
  doc
}: {
  id?: string;
  type: string;
  doc?: any;
}) => {
  const storageKey = `erxes_${type}_columns_config`;
  const storageItem = localStorage.getItem(storageKey);

  if (!storageItem) {
    return;
  }

  const configs = JSON.parse(storageItem) || [];

  if (!id) {
    const _id = Math.random().toString();

    configs.push({
      _id,
      order: configs.length,
      checked: false,
      name: `customFieldsData.${_id}`,
      text: doc.text
    });

    return localStorage.setItem(storageKey, JSON.stringify(configs));
  }

  const key = `customFieldsData.${id}`;

  const items = !doc
    ? configs.filter(config => config.name !== key)
    : configs.map(config => {
        if (config.name === key) {
          return { ...config, label: doc.text };
        }

        return config;
      });

  localStorage.setItem(storageKey, JSON.stringify(items));
};

export { updateCustomFieldsCache };
