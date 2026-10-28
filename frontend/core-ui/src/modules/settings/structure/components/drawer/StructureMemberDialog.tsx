import { zodResolver } from '@hookform/resolvers/zod';
import { Button, DatePicker, Dialog, Form, Switch } from 'erxes-ui';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SelectMember } from 'ui-modules';
import {
  IStructureAccessMember,
  useStructureAccessMutations,
} from '@/structure-access';
import { useStructureFeedback } from '../../hooks/useStructureFeedback';
import { useStructureMembershipSync } from '../../hooks/useStructureMembershipSync';
import {
  getStructureMemberSchema,
  TStructureMemberForm,
} from '../../schemas/structureEntitySchema';
import { IStructureEntityDetail } from '../../types/structureEntity';

const toDate = (value?: unknown) => (value instanceof Date ? value : undefined);

const toFormValues = (
  member: IStructureAccessMember | null,
): TStructureMemberForm => ({
  userId: member?.userId ?? '',
  isPrimary: Boolean(member?.isPrimary),
  startsAt: undefined,
  endsAt: undefined,
});

export const StructureMemberDialog = ({
  entity,
  member,
  onClose,
}: {
  entity: IStructureEntityDetail;
  member: IStructureAccessMember | null;
  onClose: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const schema = useMemo(() => getStructureMemberSchema(t), [t]);
  const form = useForm<TStructureMemberForm>({
    resolver: zodResolver(schema),
    defaultValues: toFormValues(member),
  });
  const { addMember, editMember, loading } = useStructureAccessMutations();
  const syncMembership = useStructureMembershipSync();
  const { success, failure } = useStructureFeedback();

  const onCompleted = (title: string) => {
    success(title);
    syncMembership([entity._id]);
    onClose();
  };

  const onSubmit = ({
    userId,
    isPrimary,
    startsAt,
    endsAt,
  }: TStructureMemberForm) => {
    if (member) {
      editMember({
        variables: { _id: member._id, isPrimary },
        refetchQueries: [],
        onCompleted: () => onCompleted(t('member-updated')),
        onError: failure,
      });
      return;
    }

    addMember({
      variables: {
        entityId: entity._id,
        userId,
        isPrimary,
        startsAt: startsAt?.toISOString(),
        endsAt: endsAt?.toISOString(),
      },
      refetchQueries: [],
      onCompleted: () => onCompleted(t('member-added')),
      onError: failure,
    });
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <Dialog.ContentCombined
        title={member ? t('edit-member') : t('add-person')}
        description={t('member-dialog-description', { title: entity.title })}
        className="sm:max-w-lg"
      >
        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            {!member && (
              <Form.Field
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('member')}</Form.Label>
                    <SelectMember.FormItem
                      value={field.value}
                      onValueChange={(value) =>
                        field.onChange(typeof value === 'string' ? value : '')
                      }
                      placeholder={t('select-member')}
                    />
                    <Form.Message />
                  </Form.Item>
                )}
              />
            )}
            <Form.Field
              control={form.control}
              name="isPrimary"
              render={({ field }) => (
                <Form.Item className="flex flex-row items-center justify-between gap-4 rounded-lg border p-3">
                  <div className="flex flex-col gap-1">
                    <Form.Label>{t('primary-node')}</Form.Label>
                    <Form.Description>
                      {t('primary-node-description')}
                    </Form.Description>
                  </div>
                  <Form.Control>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </Form.Control>
                </Form.Item>
              )}
            />
            {!member && (
              <div className="grid grid-cols-2 gap-3">
                <Form.Field
                  control={form.control}
                  name="startsAt"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>{t('starts-at')}</Form.Label>
                      <DatePicker
                        mode="single"
                        value={field.value}
                        placeholder={t('today')}
                        onChange={(date) => field.onChange(toDate(date))}
                      />
                      <Form.Message />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  control={form.control}
                  name="endsAt"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>{t('ends-at')}</Form.Label>
                      <DatePicker
                        mode="single"
                        value={field.value}
                        placeholder={t('no-end-date')}
                        onChange={(date) => field.onChange(toDate(date))}
                      />
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              </div>
            )}
            <Dialog.Footer>
              <Button type="button" variant="secondary" onClick={onClose}>
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={loading}>
                {t('save')}
              </Button>
            </Dialog.Footer>
          </form>
        </Form>
      </Dialog.ContentCombined>
    </Dialog>
  );
};
