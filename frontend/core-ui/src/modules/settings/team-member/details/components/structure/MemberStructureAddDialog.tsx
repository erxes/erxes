import { zodResolver } from '@hookform/resolvers/zod';
import { IconPlus } from '@tabler/icons-react';
import {
  Button,
  DatePicker,
  Dialog,
  Form,
  Spinner,
  Switch,
  toast,
} from 'erxes-ui';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SelectStructureEntities } from 'ui-modules';
import { useStructureAccessMutations } from '@/structure-access';
import {
  getMembershipFormSchema,
  TMembershipForm,
} from '@/settings/team-member/schema/membership';
import { evictUserStructureMemberships } from '@/settings/team-member/utils/evictUserStructureMemberships';

const single = (value?: string[] | string) =>
  (Array.isArray(value) ? value[0] : value) || '';

const MemberStructureAddForm = ({
  userId,
  excludeIds,
  hasPrimary,
  onDone,
}: {
  userId: string;
  excludeIds: string[];
  hasPrimary: boolean;
  onDone: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const schema = useMemo(() => getMembershipFormSchema(t), [t]);
  const { addMember, loading } = useStructureAccessMutations();

  const form = useForm<TMembershipForm>({
    resolver: zodResolver(schema),
    defaultValues: { entityId: '', isPrimary: !hasPrimary },
  });

  const onSubmit = ({ startsAt, endsAt, ...values }: TMembershipForm) =>
    addMember({
      variables: {
        ...values,
        userId,
        startsAt: startsAt?.toISOString(),
        endsAt: endsAt?.toISOString(),
      },
      update: (cache) => evictUserStructureMemberships(cache, userId),
      onCompleted: () => {
        toast({ title: t('membership-added'), variant: 'success' });
        onDone();
      },
      onError: (error) =>
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        }),
    });

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <Form.Field
          control={form.control}
          name="entityId"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('structure-node')}</Form.Label>
              <SelectStructureEntities.FormItem
                mode="single"
                value={field.value}
                excludeIds={excludeIds}
                onValueChange={(value) => field.onChange(single(value))}
              />
              <Form.Message />
            </Form.Item>
          )}
        />
        <div className="grid grid-cols-2 gap-3">
          <Form.Field
            control={form.control}
            name="startsAt"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('start-date')}</Form.Label>
                <Form.Control>
                  <DatePicker
                    value={field.value}
                    placeholder={t('start-date')}
                    onChange={(date) =>
                      field.onChange(date instanceof Date ? date : undefined)
                    }
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            control={form.control}
            name="endsAt"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('end-date')}</Form.Label>
                <Form.Control>
                  <DatePicker
                    value={field.value}
                    placeholder={t('end-date')}
                    onChange={(date) =>
                      field.onChange(date instanceof Date ? date : undefined)
                    }
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
        </div>
        <Form.Field
          control={form.control}
          name="isPrimary"
          render={({ field }) => (
            <Form.Item className="flex items-center justify-between gap-3">
              <Form.Label>{t('primary-membership')}</Form.Label>
              <Form.Control>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </Form.Control>
            </Form.Item>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onDone}>
            {t('cancel')}
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? <Spinner size="sm" /> : t('save')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export const MemberStructureAddDialog = ({
  userId,
  excludeIds,
  hasPrimary,
}: {
  userId: string;
  excludeIds: string[];
  hasPrimary: boolean;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="secondary">
          <IconPlus />
          {t('add-membership')}
        </Button>
      </Dialog.Trigger>
      <Dialog.Content className="max-w-lg">
        <Dialog.HeaderCombined
          title={t('add-membership')}
          description={t('add-membership-description')}
        />
        <MemberStructureAddForm
          userId={userId}
          excludeIds={excludeIds}
          hasPrimary={hasPrimary}
          onDone={() => setOpen(false)}
        />
      </Dialog.Content>
    </Dialog>
  );
};
