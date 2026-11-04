import { permissionAction } from 'erxes-sdk/react';
import type { extension } from '../../server';

// What `<Can action>` checks, typed by the extension's own permissions.
export const can = permissionAction<typeof extension>;

export const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Something went wrong';

const collectText = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.flatMap(collectText);
  }

  if (typeof value === 'object' && value !== null) {
    return Object.entries(value).flatMap(([key, child]) =>
      key === 'text' && typeof child === 'string'
        ? [child]
        : collectText(child),
    );
  }

  return [];
};

// Content is the editor's blocks as JSON, like frontline's. Anything else is
// shown as is.
export const previewText = (content: string) => {
  try {
    return collectText(JSON.parse(content)).join(' ').trim();
  } catch {
    return content;
  }
};
