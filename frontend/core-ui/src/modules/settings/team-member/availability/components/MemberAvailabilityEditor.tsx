import { Button, Form, Input, Popover, Select, Spinner } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useCanSetAvailability,
  useMemberAvailabilityForm,
} from '../hooks/useMemberAvailabilityForm';
import { IMemberAvailability } from '../types';
import { MemberAvailabilityBadge } from './MemberAvailabilityBadge';

type TProps = {
  userId: string;
  availability?: IMemberAvailability | null;
};

const MemberAvailabilityFormContent = ({
  userId,
  availability,
  onDone,
}: TProps & { onDone: () => void }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const { form, onSubmit, loading } = useMemberAvailabilityForm(
    userId,
    availability,
    onDone,
  );
  const status = form.watch('status');

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="flex flex-col gap-3 p-3 w-72">
        <Form.Field
          control={form.control}
          name="status"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('availability', 'Availability')}</Form.Label>
              <Select value={field.value} onValueChange={field.onChange}>
                <Form.Control>
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                </Form.Control>
                <Select.Content>
                  <Select.Item value="unset">
                    {t('availability-unset', 'Not set (automatic)')}
                  </Select.Item>
                  <Select.Item value="available">
                    {t('availability-available', 'Available')}
                  </Select.Item>
                  <Select.Item value="unavailable">
                    {t('availability-unavailable', 'Unavailable')}
                  </Select.Item>
                </Select.Content>
              </Select>
              <Form.Message />
            </Form.Item>
          )}
        />
        {status !== 'unset' && (
          <>
            <Form.Field
              control={form.control}
              name="until"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('availability-until', 'Until')}</Form.Label>
                  <Form.Control>
                    <Input type="datetime-local" {...field} />
                  </Form.Control>
                  <Form.Description>
                    {t(
                      'availability-until-description',
                      'Goes back to automatic at this time. Empty keeps it until changed.',
                    )}
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="reason"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('availability-reason', 'Reason')}</Form.Label>
                  <Form.Control>
                    <Input {...field} />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </>
        )}
        <Button type="submit" disabled={loading}>
          {loading && <Spinner containerClassName="size-4 flex-none" />}
          {t('save', 'Save')}
        </Button>
      </form>
    </Form>
  );
};

/** The member's availability; opens a form for those allowed to set it. */
export const MemberAvailabilityEditor = ({ userId, availability }: TProps) => {
  const canEdit = useCanSetAvailability(userId);
  const [open, setOpen] = useState(false);

  if (!canEdit) {
    return <MemberAvailabilityBadge availability={availability} />;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button type="button" className="inline-flex">
          <MemberAvailabilityBadge availability={availability} />
        </button>
      </Popover.Trigger>
      <Popover.Content className="p-0 w-auto" align="start">
        {open && (
          <MemberAvailabilityFormContent
            userId={userId}
            availability={availability}
            onDone={() => setOpen(false)}
          />
        )}
      </Popover.Content>
    </Popover>
  );
};
