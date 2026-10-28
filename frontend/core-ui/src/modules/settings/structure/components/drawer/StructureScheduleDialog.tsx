import { Button, Dialog, Form, Separator } from 'erxes-ui';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { useStructureEntitySave } from '../../hooks/useStructureEntitySave';
import { useWorkhoursForm } from '../../hooks/useWorkhoursForm';
import { IStructureEntityDetail } from '../../types/structureEntity';
import { IWorkhoursForm, WorkDay } from '../../types/workhours';
import {
  toStructureScheduleInput,
  toWorkhoursFormValues,
} from '../../utils/structureSchedule';
import { StructureHolidays } from '../workhours/StructureHolidays';
import { WeekDayRow } from '../workhours/WeekDayRow';

export const StructureScheduleDialog = ({
  entity,
  onClose,
}: {
  entity: IStructureEntityDetail;
  onClose: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });
  const { form } = useWorkhoursForm(toWorkhoursFormValues(entity.schedule));
  const { save, saving } = useStructureEntitySave();

  const onSubmit = async (values: IWorkhoursForm) => {
    const saved = await save(
      { _id: entity._id, schedule: toStructureScheduleInput(values) },
      t('schedule-saved'),
    );

    if (saved) {
      onClose();
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <Dialog.ContentCombined
        title={t('schedule-title', { title: entity.title })}
        description={t('capability-dialog-description', {
          title: entity.title,
        })}
        className="max-h-[90vh] overflow-y-auto sm:max-w-4xl"
      >
        <Form {...form}>
          <form
            className="flex flex-col"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            {Object.values(WorkDay).map((day, index) => (
              <Fragment key={day}>
                {index !== 0 && <Separator />}
                <WeekDayRow weekDay={day} />
              </Fragment>
            ))}
            <Separator />
            <StructureHolidays />
            <Dialog.Footer>
              <Button type="button" variant="secondary" onClick={onClose}>
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={saving}>
                {t('save')}
              </Button>
            </Dialog.Footer>
          </form>
        </Form>
      </Dialog.ContentCombined>
    </Dialog>
  );
};
