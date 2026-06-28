import { TPropertyInputMeta, TPropertyInputProps } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { ComponentType, useState } from 'react';
import { IField, pluginsConfigState } from 'ui-modules';

const TOKEN_REGEX = /^\[\[\s*([\s\S]*?)\s*\]\]$/;

const unwrapToken = (value?: string) => {
  if (!value) {
    return '';
  }

  const match = String(value).match(TOKEN_REGEX);

  return match ? match[1] : String(value);
};

const wrapToken = (value: string) => (value ? `[[ ${value} ]]` : '');

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

export const ManagePropertyCustomInput = ({
  CustomInput,
  value,
  onChange,
  disabled,
}: {
  CustomInput: ComponentType<TPropertyInputProps>;
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}) => {
  const [meta, setMeta] = useState<TPropertyInputMeta>({});

  return (
    <CustomInput
      value={unwrapToken(value)}
      onValueChange={(next) => onChange(wrapToken(next))}
      meta={meta}
      onMetaChange={setMeta}
      disabled={disabled}
    />
  );
};
