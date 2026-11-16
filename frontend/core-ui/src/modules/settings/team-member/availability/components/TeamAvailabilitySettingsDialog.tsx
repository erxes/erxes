import { IconUserCheck, IconX } from '@tabler/icons-react';
import {
  Button,
  Dialog,
  Form,
  Label,
  RadioGroup,
  Skeleton,
  Spinner,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SelectSegment } from 'ui-modules';
import { useTeamAvailabilitySettingsForm } from '../hooks/useTeamAvailabilitySettingsForm';

const USER_SEGMENT_CONTENT_TYPE = 'core:organization.users';

const TeamAvailabilitySettingsForm = ({ onDone }: { onDone: () => void }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const { form, onSubmit, loading, saving } =
    useTeamAvailabilitySettingsForm(onDone);

  if (loading) {
    return <Skeleton className="h-32 m-3" />;
  }

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="flex flex-col gap-4 px-3 pb-3">
        <Form.Field
          control={form.control}
          name="segmentId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('availability-busy-segment', 'Busy members segment')}</Form.Label>
              <SelectSegment
                contentType={USER_SEGMENT_CONTENT_TYPE}
                selected={field.value}
                nullable
                onSelect={(value) =>
                  field.onChange(typeof value === 'string' ? value : '')
                }
              />
              <Form.Description>
                {t(
                  'availability-busy-segment-description',
                  'Members of this segment are unavailable automatically. Without a segment, only what members set by hand counts.',
                )}
              </Form.Description>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="precedence"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>
                {t('availability-precedence', 'When they disagree')}
              </Form.Label>
              <Form.Control>
                <RadioGroup value={field.value} onValueChange={field.onChange}>
                  <div className="flex items-center gap-2">
                    <RadioGroup.Item value="segment" id="availability-segment" />
                    <Label htmlFor="availability-segment">
                      {t('availability-precedence-segment', 'The segment wins')}
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroup.Item value="manual" id="availability-manual" />
                    <Label htmlFor="availability-manual">
                      {t('availability-precedence-manual', 'What is set by hand wins')}
                    </Label>
                  </div>
                </RadioGroup>
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Button type="submit" disabled={saving}>
          {saving && <Spinner containerClassName="size-4 flex-none" />}
          {t('save', 'Save')}
        </Button>
      </form>
    </Form>
  );
};

export const TeamAvailabilitySettingsDialog = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="outline">
          <IconUserCheck />
          {t('availability', 'Availability')}
        </Button>
      </Dialog.Trigger>
      <Dialog.Content className="max-w-md p-0">
        <Dialog.Header className="px-3 py-[13px] border-b border-muted">
          <Dialog.Title className="flex items-center gap-2 text-sm">
            <IconUserCheck size={14} />
            {t('availability', 'Availability')}
          </Dialog.Title>
          <Dialog.Description className="sr-only">
            {t('availability-settings', 'Availability settings')}
          </Dialog.Description>
          <Dialog.Close asChild>
            <Button variant="secondary" size="icon" className="absolute right-2 top-2">
              <IconX />
            </Button>
          </Dialog.Close>
        </Dialog.Header>
        {open && <TeamAvailabilitySettingsForm onDone={() => setOpen(false)} />}
      </Dialog.Content>
    </Dialog>
  );
};
