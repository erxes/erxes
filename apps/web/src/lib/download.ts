export const downloadBlob = (fileName: string, blob: Blob) => {
  const link = document.createElement('a');

  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(link.href);
};

export const downloadText = (fileName: string, text: string, type: string) =>
  downloadBlob(fileName, new Blob([text], { type }));
