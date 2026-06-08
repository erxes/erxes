import fs from 'fs';
import path from 'path';

function randomId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function reportDataToCSV(data: { labels: string[]; datasets: { label?: string; data: number[] }[] }): string {
  const rows: string[][] = [];

  // Header
  const headers = ['Label', ...data.datasets.map((ds, idx) => ds.label || `Data ${idx + 1}`)];
  rows.push(headers);

  // Data rows
  for (let i = 0; i < data.labels.length; i++) {
    const row = [data.labels[i]];
    for (const ds of data.datasets) {
      row.push(String(ds.data[i] ?? ''));
    }
    rows.push(row);
  }

  return rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
}

// (Optional) If you need file saving later, keep this; otherwise remove.
export async function saveCSVAndGetUrl(subdomain: string, csvContent: string, filename?: string): Promise<string> {
  const uploadDir = path.join(process.cwd(), 'uploads', 'reports');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const fileId = filename || `${randomId()}.csv`;
  const filePath = path.join(uploadDir, fileId);
  fs.writeFileSync(filePath, csvContent, 'utf-8');

  return `/api/reports/download/${fileId}`;
}