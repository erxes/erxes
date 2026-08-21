export const EXPORT_PADDING = 160;
export const MIN_EXPORT_WIDTH = 800;
export const MIN_EXPORT_HEIGHT = 600;

export const downloadDataUrl = (filename: string, dataUrl: string) => {
  const link = document.createElement('a');

  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const downloadJsonFile = (filename: string, data: unknown) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);

  downloadDataUrl(filename, url);
  URL.revokeObjectURL(url);
};

export const getCurrentThemeBackgroundColor = () => {
  const bodyBackground = getComputedStyle(document.body).backgroundColor;

  if (bodyBackground && bodyBackground !== 'rgba(0, 0, 0, 0)') {
    return bodyBackground;
  }

  const isDarkTheme =
    document.documentElement.classList.contains('dark') ||
    getComputedStyle(document.documentElement).colorScheme === 'dark';

  return isDarkTheme ? '#20211f' : '#ffffff';
};
