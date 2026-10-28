import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Dialog, Form } from 'erxes-ui';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SelectMember } from 'ui-modules';
import {
  IStructureAccessSeat,
  useStructureSeatMutations,
} from '@/structure-access';
import { useStructureFeedback } from '../../hooks/useStructureFeedback';
import { useStructureMembershipSync } from '../../hooks/useStructureMembershipSync';
import {
  getStructureSeatHoldersSchema,
  TStructureSeatHoldersForm,
} from '../../schemas/structureEntitySchema';
import { IStructureEntityDetail } from '../../types/structureEntity';

const toIds = (value?: string[] | string | null) => {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
};

export const StructureSeatHoldersDialog = ({
  entity,
  seat,
  onClose,
}: {
  entity: IStructureEntityDetail;
  seat: IStructureAccessSeat;
  onClose: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const schema = useMemo(() => getStructureSeatHoldersSchema(t), [t]);
  const form = useForm<TStructureSeatHoldersForm>({
    resolver: zodResolver(schema),
    defaultValues: { userIds: [] },
  });
  const { addHolders, loading } = useStructureSeatMutations();
  const syncMembership = useStructureMembershipSync();
  const { success, failure } = useStructureFeedback();

  const onSubmit = ({ userIds }: TStructureSeatHoldersForm) =>
    addHolders({
      variables: { seatId: seat._id, userIds },
      onCompleted: () => {
        success(t('holders-added', { count: userIds.length }));
        syncMembership([entity._id]);
        onClose();
      },
      onError: failure,
    });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <Dialog.ContentCombined
        title={t('add-holders-title', {
          position: seat.position?.name ?? seat.positionId,
        })}
        description={t('holders-dialog-description', { title: entity.title })}
        className="sm:max-w-md"
      >
        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <Form.Field
              control={form.control}
              name="userIds"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('holders')}</Form.Label>
                  <SelectMember.FormItem
                    mode="multiple"
                    value={field.value}
                    onValueChange={(value) => field.onChange(toIds(value))}
                  />
                  <Form.Description>
                    {t('holders-description')}
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Dialog.Footer>
              <Button type="button" variant="secondary" onClick={onClose}>
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={loading}>
                {t('add-holders')}
              </Button>
            </Dialog.Footer>
          </form>
        </Form>
      </Dialog.ContentCombined>
    </Dialog>
  );
};
