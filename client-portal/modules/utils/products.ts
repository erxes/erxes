export const getConfig = (key: string) => {
  const sidebarConfig = localStorage.getItem(key);

  if (sidebarConfig) {
    return JSON.parse(sidebarConfig);
  }
};

export const setConfig = (key, params) => {
  localStorage.setItem(key, JSON.stringify(params));
};
