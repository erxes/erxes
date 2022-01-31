export const getThemeItem = code => {
  const configs = JSON.parse(
    localStorage.getItem('erxes_theme_configs') || '[]'
  );
  const config = configs.find(c => c.code === `THEME_${code.toUpperCase()}`);

  return config ? config.value : '';
};
