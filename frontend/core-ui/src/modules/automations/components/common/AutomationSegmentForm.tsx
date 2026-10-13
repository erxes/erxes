import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  IconBookmarkPlus,
  IconListSearch,
  IconLoader2,
} from '@tabler/icons-react';
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

// Segments an automation writes belong to it: no name, not listed, not
// materialized.
export const AUTOMATION_SEGMENT_OWNER = 'automation';

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
    ownedBy={AUTOMATION_SEGMENT_OWNER}
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
  const { t } = useTranslation('automations');
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button variant="ghost" size="sm" type="button">
          <IconListSearch />
          {t('common-use-existing-segment')}
        </Button>
      </Popover.Trigger>
      <Popover.Content
        align="end"
        className="w-[420px] max-w-[calc(100vw-2rem)]"
      >
        <p className="text-sm text-muted-foreground pb-3">
          {t('common-segment-stays-organizations')}
        </p>
        <SelectSegment
          contentType={contentType}
          selected={segmentId}
          unnamedLabel={t('common-current-conditions')}
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
  const { handleSave, saving } = useSegmentActions({ callback });
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
      saving={saving}
      onSave={form.handleSubmit(handleSave, handleValidationErrors)}
    />
  );
};

const KeepAsSegment = ({
  callback,
}: {
  callback: (contentId: string) => void;
}) => {
  const { t } = useTranslation('automations');
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
          {t('common-keep-as-segment')}
        </Button>
      </Dialog.Trigger>
      <Dialog.ContentCombined
        className="max-w-[640px]"
        title={t('common-keep-as-segment')}
        description={t('common-keep-as-segment-description')}
      >
        <div className="p-4">
          <p className="text-sm text-muted-foreground pb-3">
            {t('common-keep-as-segment-body')}
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
            {saving ? (
              <>
                <IconLoader2 className="animate-spin" />
                {t('common-saving')}
              </>
            ) : (
              t('save')
            )}
          </Button>
        </Dialog.Footer>
      </Dialog.ContentCombined>
    </Dialog>
  );
};
