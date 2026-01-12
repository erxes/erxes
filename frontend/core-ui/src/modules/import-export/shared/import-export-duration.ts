export function formatImportExportDuration(start: string, end: string): string {
  const ms = new Date(end).getTime() - new Date(start).getTime();

  if (ms < 1000) {
    return `${ms}ms`;
  }

  const seconds = Math.floor(ms / 1000);

  if (seconds < 60) {
    return `${seconds}sec`;
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes}min`;
  }

  const hours = Math.floor(minutes / 60);

  return `${hours}hr`;
}
