export const getThemeItem = code => {
  const configs = JSON.parse(
    localStorage.getItem('erxes_theme_configs') || '[]'
  );
  const config = configs.find(c => c.code === `THEME_${code.toUpperCase()}`);

  return config ? config.value : '';
};

export const generateRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';

  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};
