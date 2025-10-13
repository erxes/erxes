import {
  BlockEditor,
  Button,
  Spinner,
  cn,
  useBlockEditor,
  usePreviousHotkeyScope,
} from 'erxes-ui';

import { Block } from '@blocknote/core';
import { IconArrowUp } from '@tabler/icons-react';
import { useDealsContext } from '@/deals/context/DealContext';
import { useDebounce } from 'use-debounce';
import { useState } from 'react';

const safeJSON = (str: any) => {
  try {
    return typeof str === 'string' ? JSON.parse(str) : str;
  } catch {
    return undefined;
  }
};

const SalesDescription = ({
  dealDescription,
  dealId,
}: {
  dealDescription: any;
  dealId: string;
}) => {
  const parsedDescription = dealDescription
    ? safeJSON(dealDescription)
    : undefined;

  const initialDescriptionContent =
    Array.isArray(parsedDescription) && parsedDescription.length > 0
      ? parsedDescription
      : undefined;

  const { goBackToPreviousHotkeyScope } = usePreviousHotkeyScope();
  const [description, setDescription] = useState<Block[] | undefined>(
    initialDescriptionContent,
  );

  const editor = useBlockEditor({
    initialContent: description,
    placeholder: 'Add a description...',
  });

  const { editDeals, loading } = useDealsContext();

  const handleChange = async () => {
    const content = await editor?.document;
    if (content) {
      content.pop();
      setDescription(content as Block[]);
    }
  };

  const [debouncedDescriptionContent] = useDebounce(description, 1000);

  const onSave = async () => {
    if (description?.length === 0) {
      return;
    }

    editDeals({
      variables: {
        _id: dealId,
        description: JSON.stringify(debouncedDescriptionContent),
      },
    });
  };

  return (
    <div className="flex flex-col h-full py-4 gap-1 rounded-lg relative">
      <BlockEditor
        editor={editor}
        onChange={handleChange}
        disabled={loading}
        className={cn('h-full w-full overflow-y-auto')}
        onBlur={() => goBackToPreviousHotkeyScope()}
      />
      {description?.length !== 0 && (
        <div className="flex px-6 gap-4">
          <Button
            size="lg"
            className="ml-auto"
            disabled={loading}
            onClick={onSave}
          >
            {loading ? <Spinner size="sm" /> : <IconArrowUp />}
            Save
          </Button>
        </div>
      )}
    </div>
  );
};

export default SalesDescription;
