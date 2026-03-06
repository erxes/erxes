import { Input, Separator, useBlockEditor, BlockEditor, Dialog, Button } from 'erxes-ui';
import { useUpdateTriage } from '@/triage/hooks/useUpdateTriage';
import { useDebounce } from 'use-debounce';
import { useEffect, useState } from 'react';
import { Block } from '@blocknote/core';
import { ITriage } from '@/triage/types/triage';
import { ActivityList } from '@/activity/components/ActivityList';
import { SelectPriority } from '@/operation/components/SelectPriority';
import { ConvertToTask } from './triage-selects/ConvertToTask';
import { DeclineTriage } from './triage-selects/DeclineTriage';
import { SelectStatus } from '@/operation/components/SelectStatus';
import { useConvertTriage } from '../hooks/useConvertTriage';
import { STATUS_TYPES } from '@/operation/components/StatusInline';

export const TriageFields = ({ triage }: { triage: ITriage }) => {
  const { _id: triageId, priority, status, name: _name } = triage || {};

  const description = (triage as ITriage)?.description;
  const parsedDescription = description ? JSON.parse(description) : undefined;
  const initialDescriptionContent =
    Array.isArray(parsedDescription) && parsedDescription.length > 0
      ? parsedDescription
      : undefined;

  const [descriptionContent, setDescriptionContent] = useState<
    Block[] | undefined
  >(initialDescriptionContent);

  const editor = useBlockEditor({
    initialContent: descriptionContent,
    placeholder: 'Description...',
  });
  const { updateTriage } = useUpdateTriage();
  const { convertTriageToTask } = useConvertTriage();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<number | null>(null);

  const [name, setName] = useState(_name);

  const handleDescriptionChange = async () => {
    const content = await editor?.document;
    if (content) {
      content.pop();
      setDescriptionContent(content as Block[]);
    }
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
      JSON.stringify(description ? JSON.parse(description) : undefined)
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

  return (
    <div className="flex flex-col gap-3">
      <Input
        className="shadow-none focus-visible:shadow-none h-8 text-xl p-0"
        placeholder="Triage Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div className="gap-2 flex flex-wrap w-full">
        <SelectPriority
          variant="detail"
          value={priority}
          onValueChange={(value) => {
            updateTriage({
              variables: {
                _id: triageId,
                input: {
                  priority: Number(value),
                },
              },
            });
          }}
        />

        <SelectStatus
          variant="detail"
          value={status}
          useExtendedLabels={true}
          onValueChange={(value) => {
            if (value !== STATUS_TYPES.TRIAGE) {
              setPendingStatus(value);
              setConfirmOpen(true);
            }
          }}
        />
        <ConvertToTask triageId={triageId} />
        <DeclineTriage triageId={triageId} />
      </div>
      <Separator className="my-4" />
      <div className="min-h-56 overflow-y-auto">
        <BlockEditor
          editor={editor}
          onChange={handleDescriptionChange}
          className="min-h-full read-only"
        />
      </div>
      <ActivityList contentId={triageId} contentDetail={triage} />
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Convert to Task</Dialog.Title>
          </Dialog.Header>
          <div className="py-4">
            <p>
              Changing the status will convert the triage to a task. Are you sure you want
              to proceed?
            </p>
          </div>
          <Dialog.Footer>
            <Dialog.Close asChild>
              <Button variant="outline">Cancel</Button>
            </Dialog.Close>
            <Button
              onClick={() => {
                if (pendingStatus) {
                  convertTriageToTask({
                    variables: { id: triageId, status: pendingStatus },
                  });
                }
                setConfirmOpen(false);
              }}
            >
              Confirm
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    </div>
  );
};
