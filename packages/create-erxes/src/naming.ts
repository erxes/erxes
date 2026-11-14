// Lowercase words separated by single dashes, e.g. `inventory` or `erxes-agent-v2`.
const NAME_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

// Names erxes itself owns as services or gateway routes.
const RESERVED_NAMES = new Set(['core', 'gateway', 'api', 'graphql', 'health']);

/**
 * Core keeps its own plugin registry, so an old plugin's name is free for its
 * port. Core allows up to 40 characters.
 */
export const validatePluginName = (name: string) => {
  if (!NAME_PATTERN.test(name)) {
    return 'Use lowercase letters and digits, optionally separated by single dashes (e.g. inventory, erxes-agent-v2), starting with a letter.';
  }

  if (RESERVED_NAMES.has(name)) return `"${name}" is reserved by erxes.`;

  if (name.length > 40) return 'Use at most 40 characters.';

  return undefined;
};

/** Core shows these in its plugin list: one line each, at most `max` characters. */
export const validateLine = (max: number) => (text: string) => {
  if (/[\r\n]/.test(text)) return 'Use one line.';

  if (text.length > max) return `Use at most ${max} characters.`;

  return undefined;
};

const capitalize = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);

export const derivePluginNames = (name: string, title?: string) => {
  const words = name.split('-');
  const id = words.join('_');

  return {
    /** The plugin's name as typed: the directory and the npm-style name. */
    name,
    /** Core's name for it: tables, permissions, events and the UI remote start with it. */
    id,
    /** The Module Federation remote core-ui loads. */
    remote: `${id}_ui`,
    /** The React component the remote exposes. */
    pascal: words.map(capitalize).join(''),
    /** The label in erxes navigation and docs. */
    title: title?.trim() || words.map(capitalize).join(' '),
  };
};

export type PluginNames = ReturnType<typeof derivePluginNames>;
