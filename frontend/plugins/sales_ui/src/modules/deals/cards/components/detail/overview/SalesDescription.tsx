import {
  BlockEditor,
  Button,
  Spinner,
  cn,
  useBlockEditor,
  usePreviousHotkeyScope,
} from 'erxes-ui';
import {
  IconAlignJustified,
  IconArrowUp,
  IconChevronDown,
  IconChevronUp,
} from '@tabler/icons-react';
import { useCallback, useState } from 'react';

import { Block } from '@blocknote/core';
import { useDealsContext } from '@/deals/context/DealContext';
import { useDebounce } from 'use-debounce';

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
  const [expanded, setExpanded] = useState(false);

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

  const onSave = useCallback(() => {
    editDeals({
      variables: {
        _id: dealId,
        description: JSON.stringify(debouncedDescriptionContent),
      },
    });
  }, [debouncedDescriptionContent, dealId, editDeals]);

  return (
    <div className="flex flex-col h-full my-2 py-2 mx-2 px-4 gap-1 rounded-lg relative group sales-description">
      <div className="flex items-center pb-2 gap-2">
        <IconAlignJustified size={16} className="text-gray-500" />
        <h4 className="uppercase text-sm text-gray-500 flex items-center w-fit select-none text-muted-foreground">
          Description
        </h4>
      </div>

      <div
        className={cn(
          'relative transition-all duration-300',
          expanded ? 'max-h-none' : 'max-h-[100px] cursor-pointer',
        )}
        onClick={() => {
          if (!expanded) setExpanded(true);
        }}
      >
        <div
          className={cn(
            'relative overflow-y-auto pb-4 transition-all duration-300',
            !expanded && 'pointer-events-none max-h-[100px]',
          )}
        >
          <BlockEditor
            editor={editor}
            onChange={handleChange}
            disabled={loading}
            className="w-full"
            onBlur={() => goBackToPreviousHotkeyScope()}
          />
        </div>

        {!expanded && description && description.length > 0 && (
          <>
            <div className="absolute bottom-0 left-0 right-0 h-38 pointer-events-none bg-gradient-to-t from-white to-transparent w-full" />

            <div className="absolute bottom-[-15px] left-0 right-0 flex items-center justify-center pb-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary transition-colors">
                <IconChevronDown size={20} />
              </div>
            </div>
          </>
        )}

        {expanded && description && description.length > 0 && (
          <div
            className="absolute cursor-pointer bottom-[-15px] left-0 right-0 flex items-center justify-center pb-1 hover:bg-muted transition-colors rounded-lg mx-4"
            onClick={() => setExpanded(false)}
          >
            <div className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
              <IconChevronUp size={20} />
            </div>
          </div>
        )}
      </div>

      {expanded && (
        <div className="flex gap-4">
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
