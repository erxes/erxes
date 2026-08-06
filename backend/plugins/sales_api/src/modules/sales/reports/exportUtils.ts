import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

export function reportDataToCSV(data: {
  labels: string[];
  datasets: { label?: string; data: number[] }[];
}): string {
  const rows: string[][] = [];

  const headers = [
    'Label',
    ...data.datasets.map((ds, idx) => ds.label || `Data ${idx + 1}`),
  ];

  rows.push(headers);

  for (let i = 0; i < data.labels.length; i++) {
    const row = [data.labels[i]];

    for (const ds of data.datasets) {
      row.push(String(ds.data[i] ?? ''));
    }

    rows.push(row);
  }

  return rows
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','),
    )
    .join('\n');
}

export async function saveCSVAndGetUrl(
  subdomain: string,
  csvContent: string,
  filename?: string,
): Promise<string> {
  const uploadDir = path.join(process.cwd(), 'uploads', 'reports');

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileId = filename || `${randomUUID()}.csv`;
  const filePath = path.join(uploadDir, fileId);

  fs.writeFileSync(filePath, csvContent, 'utf-8');

  return `/api/reports/download/${fileId}`;
}