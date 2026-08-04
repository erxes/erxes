import {
  TMessageTriggerSourceIds,
  TMessageTriggerSourceMode,
} from '../types/messageTrigger';

export const useOpenThreadTriggerEditor = ({
  sourceIds = [],
  onSourceIdsChange,
}: {
  sourceIds?: TMessageTriggerSourceIds;
  onSourceIdsChange: (value: TMessageTriggerSourceIds) => void;
}) => {
  const selectedSourceId = sourceIds[0];

  const handleSourceIdChange = (value?: string) => {
    onSourceIdsChange(value ? [value] : []);
  };

  return {
    selectedSourceId,
    handleSourceIdChange,
    isSpecificMode: (sourceMode: TMessageTriggerSourceMode) =>
      sourceMode === 'specific',
  };
};
