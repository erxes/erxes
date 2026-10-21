import { type IBlockEditor } from 'erxes-ui';
import { useUpdateTriage } from '@/triage/hooks/useUpdateTriage';
import { useDebounce } from 'use-debounce';
import { useEffect, useState } from 'react';
import { useConvertTriage } from '@/triage/hooks/useConvertTriage';
import { STATUS_TYPES } from '@/operation/components/StatusInline';
import { parseDescriptionBlocks } from '@/operation/utils/parseDescriptionBlocks';
import { useDescriptionEditor } from '@/operation/hooks/useDescriptionEditor';
import { normalizeDescriptionBlocks } from '@/operation/utils/normalizeDescriptionBlocks';
import type {
  TriageFieldsEditorOptions,
  TriageFieldsEditorState,
} from '@/triage/types/triageFields';

export const useTriageFieldsEditor = ({
  triage,
  descriptionPlaceholder,
}: TriageFieldsEditorOptions): TriageFieldsEditorState => {
  const { _id: triageId, name: _name, description } = triage;
  const [descriptionContent, setDescriptionContent] =
    useState<IBlockEditor['document']>();
  const { editor, isReady: isDescriptionReady } = useDescriptionEditor(
    description,
    descriptionPlaceholder,
  );
  const { updateTriage } = useUpdateTriage();
  const { convertTriageToTask } = useConvertTriage();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<number | null>(null);

  const [name, setName] = useState(_name);

  const handleDescriptionChange = (): void => {
    setDescriptionContent(normalizeDescriptionBlocks(editor.document));
  };

  const [debouncedDescriptionContent] = useDebounce(descriptionContent, 1000);
  const [debouncedName] = useDebounce(name, 1000);

  useEffect(() => {
    if (!debouncedName || debouncedName === _name) return;
    updateTriage({
      variables: {
        _id: triageId,
        input: {
          name: debouncedName,
        },
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedName]);

  useEffect(() => {
    if (!debouncedDescriptionContent) return;
    if (
      JSON.stringify(debouncedDescriptionContent) ===
      JSON.stringify(parseDescriptionBlocks(description))
    ) {
      return;
    }
    updateTriage({
      variables: {
        _id: triageId,
        input: {
          description: JSON.stringify(debouncedDescriptionContent),
        },
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedDescriptionContent]);

  const handlePriorityChange = (value: number): void => {
    updateTriage({
      variables: { _id: triageId, input: { priority: Number(value) } },
    });
  };
  const handleStatusChange = (value: number): void => {
    if (value !== STATUS_TYPES.TRIAGE) {
      setPendingStatus(value);
      setConfirmOpen(true);
    }
  };
  const handleConfirmConversion = (): void => {
    if (pendingStatus) {
      convertTriageToTask({
        variables: { id: triageId, status: pendingStatus },
      });
    }
    setConfirmOpen(false);
  };

  return {
    name,
    setName,
    editor,
    isDescriptionReady,
    confirmOpen,
    setConfirmOpen,
    handleDescriptionChange,
    handlePriorityChange,
    handleStatusChange,
    handleConfirmConversion,
  };
};
