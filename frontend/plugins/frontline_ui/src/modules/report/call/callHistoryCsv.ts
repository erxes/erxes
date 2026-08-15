import type { CallHistoryEntry } from './types';

export const CALL_HISTORY_EXPORT_LIMIT = 5000;

const HEADERS = [
  'Date',
  'Time',
  'Caller',
  'Phone',
  'Carrier',
  'Direction',
  'Outcome',
  'Wait (s)',
  'Talk (s)',
  'Agent',
  'Extension',
  'Rung',
  'Queue',
  'Recording',
  'Conversation',
  'Call id',
];

const cell = (value: unknown): string => {
  const text = value === null || value === undefined ? '' : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const pad = (value: number): string => String(value).padStart(2, '0');

const splitTimestamp = (value: string | null): [string, string] => {
  if (!value) return ['', ''];
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return ['', ''];
  return [
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`,
  ];
};

export const buildCallHistoryCsv = (entries: CallHistoryEntry[]): string => {
  const rows = entries.map((entry) => {
    const [date, time] = splitTimestamp(entry.startedAt);

    return [
      date,
      time,
      entry.customerName ?? '',
      entry.customerPhone ?? '',
      entry.carrier,
      entry.direction,
      entry.outcome,
      entry.waitTime ?? '',
      entry.talkTime,
      entry.agentName ?? '',
      entry.agentExtension ?? '',
      entry.rungCount,
      entry.queue ?? '',
      entry.recordUrl ?? '',
      entry.conversationId ?? '',
      entry.uniqueid,
    ].map(cell);
  });

  return [HEADERS.map(cell), ...rows].map((row) => row.join(',')).join('\r\n');
};

export const downloadCallHistoryCsv = (
  entries: CallHistoryEntry[],
  fileName: string,
): void => {
  // A BOM keeps Excel from reading the UTF-8 names as Latin-1.
  const blob = new Blob(['﻿', buildCallHistoryCsv(entries)], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
