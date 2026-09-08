import { useState } from 'react';
import { IconBookmarkPlus, IconListSearch } from '@tabler/icons-react';
import { Button, Popover, Dialog } from 'erxes-ui';
import {
  SegmentForm,
  SelectSegment,
  useFormValidationErrorHandler,
} from 'ui-modules';
import { useSegment } from 'ui-modules/modules/segments/context/SegmentProvider';
import { useSegmentActions } from 'ui-modules/modules/segments/hooks/useSegmentActions';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { AutoamtionConfigFormFooter } from './AutomationConfigFormFooter';

const OWNER = 'automation';

export const AutomationSegmentForm = ({
  contentType,
  segmentId,
  callback,
  saveButtonLabel,
}: {
  contentType: string;
  segmentId?: string;
  callback: (contentId: string) => void;
  saveButtonLabel?: string;
}) => (
  <SegmentForm.Root
    contentType={contentType}
    segmentId={segmentId}
    ownedBy={OWNER}
  >
    <SegmentForm.Wrapper>
      <div className="flex justify-end gap-1 px-4 pt-3">
        <UseExistingSegment
          contentType={contentType}
          segmentId={segmentId}
          onSelect={callback}
        />
        <KeepAsSegment callback={callback} />
      </div>
      <SegmentForm.Content>
        <div className="mt-2">
          <SegmentForm.Group path="root" />
        </div>
      </SegmentForm.Content>
      <div className="border-t bg-background">
        <AutomationSegmentFormFooter
          saveButtonLabel={saveButtonLabel}
          callback={callback}
        />
      </div>
    </SegmentForm.Wrapper>
  </SegmentForm.Root>
);

const UseExistingSegment = ({
  contentType,
  segmentId,
  onSelect,
}: {
  contentType: string;
  segmentId?: string;
  onSelect: (contentId: string) => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button variant="ghost" size="sm" type="button">
          <IconListSearch />
          Use an existing segment
        </Button>
      </Popover.Trigger>
      <Popover.Content
        align="end"
        className="w-[420px] max-w-[calc(100vw-2rem)]"
      >
        <p className="text-sm text-muted-foreground pb-3">
          The segment stays the organization&apos;s: editing or deleting this
          automation leaves it alone.
        </p>
        <SelectSegment
          contentType={contentType}
          selected={segmentId}
          unnamedLabel="Current conditions"
          onSelect={(id) => {
            if (id) {
              onSelect(id);
              setOpen(false);
            }
          }}
        />
      </Popover.Content>
    </Popover>
  );
};

const AutomationSegmentFormFooter = ({
  callback,
  saveButtonLabel,
}: {
  callback: (contentId: string) => void;
  saveButtonLabel?: string;
}) => {
  const { form } = useSegment();
  const { isReadOnly } = useAutomation();
  const { handleSave } = useSegmentActions({ callback });
  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: 'Trigger',
  });

  // Saving here writes the segment immediately, before and regardless of the
  // automation's own save, so it needs the same permission the automation does
  if (isReadOnly) {
    return null;
  }

  return (
    <AutoamtionConfigFormFooter
      label={saveButtonLabel}
      onSave={form.handleSubmit(handleSave, handleValidationErrors)}
    />
  );
};

const KeepAsSegment = ({
  callback,
}: {
  callback: (contentId: string) => void;
}) => {
  const { form, ownedBy } = useSegment();
  const [open, setOpen] = useState(false);

  const { handleSave, saving } = useSegmentActions({
    callback: (contentId) => {
      callback(contentId);
      setOpen(false);
    },
  });

  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: 'Segment',
  });

  if (!ownedBy) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);

        if (!next) {
          form.setValue('name', '', { shouldDirty: false });
        }
      }}
    >
      <Dialog.Trigger asChild>
        <Button variant="ghost" size="sm" type="button">
          <IconBookmarkPlus />
          Keep as a segment
        </Button>
      </Dialog.Trigger>
      <Dialog.ContentCombined
        className="max-w-[640px]"
        title="Keep as a segment"
        description="Name these conditions to keep them as a segment of its own"
      >
        <div className="p-4">
          <p className="text-sm text-muted-foreground pb-3">
            Name these conditions to keep them as a segment of their own. It
            then appears in the segment list and outlives this automation.
          </p>
          <SegmentForm.Header />
        </div>
        <Dialog.Footer>
          {/* Explicitly not a submit: this sits inside the segment form, and
              the footer's own save is a different action. */}
          <Button
            type="button"
            disabled={saving}
            onClick={form.handleSubmit(handleSave, handleValidationErrors)}
          >
            Save
          </Button>
        </Dialog.Footer>
      </Dialog.ContentCombined>
    </Dialog>
  );
};
