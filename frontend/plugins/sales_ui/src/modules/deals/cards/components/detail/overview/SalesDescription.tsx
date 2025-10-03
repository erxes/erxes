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
import { useState } from 'react';

const SalesDescription = ({
  dealDescription,
  dealId,
}: {
  dealDescription: any;
  dealId: string;
}) => {
  const { goBackToPreviousHotkeyScope } = usePreviousHotkeyScope();
  const [description, setDescription] = useState<Block[]>(dealDescription);

  const editor = useBlockEditor({
    // initialContent: [dealDescription],
  });

  const { editDeals, loading } = useDealsContext();

  const handleChange = async () => {
    const content = await editor?.document;
    content.pop();
    setDescription(content as Block[]);
  };

  const onSave = async () => {
    if (description?.length === 0) {
      return;
    }

    const sendContent = await editor?.blocksToHTMLLossy(description);

    editDeals({
      variables: {
        _id: dealId,
        description: sendContent,
      },
    });
  };

  return (
    <div className="relative">
      <div
        className={cn('flex flex-col h-full py-4 gap-1 shadow-xs rounded-lg')}
      >
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
    </div>
  );
};

export default SalesDescription;
