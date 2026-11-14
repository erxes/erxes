import { TPropertyInputProps } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { ComponentType } from 'react';
import { IField, pluginsConfigState } from 'ui-modules';

const TOKEN_REGEX = /^\[\[\s*([\s\S]*?)\s*\]\]$/;

// The custom input works on the bare value; the rule stores it as a token
export const unwrapToken = (value?: string) => {
  if (!value) {
    return '';
  }

  const match = String(value).match(TOKEN_REGEX);

  return match ? match[1] : String(value);
};

export const wrapToken = (value: string) => (value ? `[[ ${value} ]]` : '');

/**
 * Resolves the plugin-registered custom property input (e.g. dealStage,
 * ticketStatus, taskStatus) for the selected field, or undefined when the
 * field has no custom component.
 */
export const useManagePropertyCustomInput = (
  propertyType?: string,
  selectedField?: IField,
): ComponentType<TPropertyInputProps> | undefined => {
  const pluginsConfig = useAtomValue(pluginsConfigState);
  const [pluginName] = propertyType?.split(':') || [];
  const customInputName = selectedField?.selectionConfig?.component;

  if (!pluginName || !customInputName) {
    return undefined;
  }

  return Object.values(pluginsConfig || {}).find(
    (pluginConfig) => pluginConfig.name === pluginName,
  )?.widgets?.propertyInputs?.[customInputName];
};
