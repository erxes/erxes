import { customAlphabet } from 'nanoid';

/**
 * Parses an automation type string by replacing the first colon (`:`) with a dot (`.`),
 * then splitting it into parts by dots.
 *
 * @param type - The automation type string (e.g., 'pluginName:moduleName.type').
 * @returns An array of type parts (e.g., ['pluginName', 'moduleName', 'type']).
 */

export const splitAutomationNodeType = (type?: string): string[] => {
  return (type || '').replace(':', '.').split('.');
};

/**
 * Generates a unique ID for automation elements like triggers, buttons, and connections.
 *
 * @param checkIds - Optional array of existing IDs to ensure the generated ID is unique.
 * @param length - Optional length of the generated ID. Defaults to 15 characters.
 * @returns A unique string ID.
 */
export const generateAutomationElementId = (
  checkIds?: string[],
  length?: number,
) => {
  const generateId = customAlphabet(
    'abcdefghijklmnopqrstuvwxyz0123456789',
    length || 15,
  );

  let newId = generateId();

  if (checkIds?.length && checkIds.includes(newId)) {
    newId = generateAutomationElementId(checkIds);
  }
  return newId;
};
