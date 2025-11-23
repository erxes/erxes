export function escapeCSVField(field: any): string {
  if (field === null || field === undefined) {
    return '';
  }
  const str = String(field);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function createErrorCSV(
  headerRow: string[],
  errorRows: any[],
  keyToHeaderMap: Record<string, string>,
): string {
  const lines: string[] = [];
  
  // Add error column to headers
  const headersWithError = [...headerRow, 'Error'];
  lines.push(headersWithError.map(escapeCSVField).join(','));

  // Create reverse map: header label -> column index
  const headerToIndexMap: Record<string, number> = {};
  headerRow.forEach((header, index) => {
    headerToIndexMap[header] = index;
  });

  // Add error rows
  for (const errorRow of errorRows) {
    const row: string[] = new Array(headerRow.length).fill('');
    
    // Map error row data back to original column positions
    for (const [key, value] of Object.entries(errorRow)) {
      if (key === 'error') {
        continue;
      }
      const headerLabel = keyToHeaderMap[key];
      if (headerLabel) {
        const columnIndex = headerToIndexMap[headerLabel];
        if (columnIndex !== undefined) {
          row[columnIndex] = value != null ? String(value) : '';
        }
      }
    }
    
    row.push(errorRow.error || 'Unknown error');
    lines.push(row.map(escapeCSVField).join(','));
  }

  return lines.join('\n');
}

