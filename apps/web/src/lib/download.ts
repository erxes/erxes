export const downloadText = (fileName: string, text: string, type: string) => {
  const link = document.createElement('a');

  link.href = URL.createObjectURL(new Blob([text], { type }));
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(link.href);
};
