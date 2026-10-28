import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Dialog, Form } from 'erxes-ui';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  IStructureAccessSeat,
  StructurePositionSelect,
  StructureSeatCoverageFields,
  useStructureSeatMutations,
} from '@/structure-access';
import { useStructureFeedback } from '../../hooks/useStructureFeedback';
import {
  getStructureSeatSchema,
  TStructureSeatForm,
} from '../../schemas/structureEntitySchema';
import { IStructureEntityDetail } from '../../types/structureEntity';

const toFormValues = (
  seat: IStructureAccessSeat | null,
): TStructureSeatForm => ({
  positionId: seat?.positionId ?? '',
  coverage: seat?.coverage ?? 'node',
  coveredEntityIds: seat?.coveredEntityIds ?? [],
});

export const StructureSeatDialog = ({
  entity,
  seat,
  onClose,
}: {
  entity: IStructureEntityDetail;
  seat: IStructureAccessSeat | null;
  onClose: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const schema = useMemo(() => getStructureSeatSchema(t), [t]);
  const form = useForm<TStructureSeatForm>({
    resolver: zodResolver(schema),
    defaultValues: toFormValues(seat),
  });
  const { addSeat, editSeat, loading } = useStructureSeatMutations();
  const { success, failure } = useStructureFeedback();

  const onCompleted = (title: string) => {
    success(title);
    onClose();
  };

  const onSubmit = ({
    positionId,
    coverage,
    coveredEntityIds,
  }: TStructureSeatForm) => {
    const covered = coverage === 'selected' ? coveredEntityIds : [];

    if (seat) {
      editSeat({
        variables: { _id: seat._id, coverage, coveredEntityIds: covered },
        onCompleted: () => onCompleted(t('seat-updated')),
        onError: failure,
      });
      return;
    }

    addSeat({
      variables: {
        entityId: entity._id,
        positionId,
        coverage,
        coveredEntityIds: covered,
      },
      onCompleted: () => onCompleted(t('seat-added')),
      onError: failure,
    });
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <Dialog.ContentCombined
        title={
          seat
            ? t('edit-seat-title', { position: seat.position?.name ?? '' })
            : t('add-seat')
        }
        description={t('seat-dialog-description', { title: entity.title })}
        className="sm:max-w-lg"
      >
        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            {!seat && (
              <Form.Field
                control={form.control}
                name="positionId"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('position')}</Form.Label>
                    <StructurePositionSelect
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                    <Form.Message />
                  </Form.Item>
                )}
              />
            )}
            <StructureSeatCoverageFields entityId={entity._id} />
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
