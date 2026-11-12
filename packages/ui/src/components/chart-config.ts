import * as React from 'react';
import { z } from 'zod';

/** CSS selector prefix per theme. */
export const THEMES = { light: '', dark: '.dark' } as const;

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

export const ChartContext = React.createContext<{ config: ChartConfig } | null>(null);

export const useChart = () => {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error('useChart must be used within a <ChartContainer />');
  }

  return context;
};

/** The first candidate that names a series: a non-empty string or a number. */
export const keyOf = (...candidates: unknown[]) => {
  const found = candidates.find(
    (candidate) => (typeof candidate === 'string' && candidate) || typeof candidate === 'number',
  );

  return typeof found === 'string' || typeof found === 'number' ? String(found) : 'value';
};

const fields = z.record(z.string(), z.unknown());

const stringField = (source: unknown, key: string) => {
  const parsed = fields.safeParse(source);
  const value = parsed.success ? parsed.data[key] : undefined;

  return typeof value === 'string' ? value : undefined;
};

/** The fill colour recharts puts on a tooltip item's data point. */
export const fillOf = (item: unknown) => {
  const parsed = fields.safeParse(item);

  return parsed.success ? stringField(parsed.data.payload, 'fill') : undefined;
};

/**
 * The config entry for a tooltip or legend item: the item's (or its data point's) `key`
 * field names the entry when it is a string, otherwise `key` itself does.
 */
export const configFor = (config: ChartConfig, item: unknown, key: string) => {
  const parsed = fields.safeParse(item);
  const nested = parsed.success ? stringField(parsed.data.payload, key) : undefined;
  const labelKey = stringField(item, key) ?? nested ?? key;

  return config[labelKey] ?? config[key];
};
