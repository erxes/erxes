import { useEffect, useState, type ReactNode } from 'react';
import { Button, Form, InfoCard, Label, useToast } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SelectBranches, SelectDepartments } from 'ui-modules';
import {
  IPricingActiveWindow,
  IPricingPlanDetail,
  PricingScheduleMoment,
} from '@/pricing/types';
import { useEditPricing } from '@/pricing/hooks/useEditPricing';
import { SelectBoardFormItem } from '@/pricing/hooks/useSelectBoard';
import { SelectPipelineFormItem } from '@/pricing/hooks/useSelectPipeline';
import { ScheduleSection } from '@/pricing/edit-pricing/components/schedule/ScheduleSection';
import { toWindowInput } from '@/pricing/utils/schedule';

interface OptionsInfoProps {
  pricingId?: string;
  pricingDetail?: IPricingPlanDetail;
  onSaveActionChange?: (action: ReactNode | null) => void;
}

interface OptionsFormValues {
  departmentIds: string[];
  branchIds: string[];
  boardId: string;
  pipelineId: string;
}

interface OptionsSnapshot {
  departmentIds: string[];
  branchIds: string[];
  boardId: string;
  pipelineId: string;
  schedule: ScheduleState;
}

interface ScheduleState {
  activeWindows: IPricingActiveWindow[];
  closedDates: string[];
  scheduleMoment: PricingScheduleMoment;
}

const EMPTY_SCHEDULE: ScheduleState = {
  activeWindows: [],
  closedDates: [],
  scheduleMoment: 'checkout',
};

const getSchedule = (pricingDetail: IPricingPlanDetail): ScheduleState => ({
  activeWindows: (pricingDetail.activeWindows || []).map(toWindowInput),
  closedDates: pricingDetail.closedDates || [],
  scheduleMoment: pricingDetail.scheduleMoment || 'checkout',
});

const OPTIONS_FORM_ID = 'pricing-options-form';

const normalizeIds = (values: string[] = []) =>
  [...values].filter(Boolean).sort((a, b) => a.localeCompare(b));

const getOptionsSnapshot = ({
  values,
  schedule,
}: {
  values: OptionsFormValues;
  schedule: ScheduleState;
}): OptionsSnapshot => ({
  departmentIds: normalizeIds(values.departmentIds),
  branchIds: normalizeIds(values.branchIds),
  boardId: values.boardId || '',
  pipelineId: values.pipelineId || '',
  schedule: {
    activeWindows: schedule.activeWindows.map(toWindowInput),
    closedDates: [...schedule.closedDates].sort(),
    scheduleMoment: schedule.scheduleMoment,
  },
});

export const OptionsInfo = ({
  pricingId,
  pricingDetail,
  onSaveActionChange,
}: OptionsInfoProps) => {
  const { editPricing, loading } = useEditPricing();
  const { toast } = useToast();
  const { t } = useTranslation('loyalty');

  const [schedule, setSchedule] = useState<ScheduleState>(EMPTY_SCHEDULE);
  const [initialSnapshot, setInitialSnapshot] =
    useState<OptionsSnapshot | null>(null);

  const form = useForm<OptionsFormValues>({
    defaultValues: {
      departmentIds: [],
      branchIds: [],
      boardId: '',
      pipelineId: '',
    },
  });

  const { control, handleSubmit, reset, setValue } = form;

  const watchedValues = form.watch();
  const currentSnapshot = getOptionsSnapshot({
    values: watchedValues,
    schedule,
  });
  const hasChanges =
    !!initialSnapshot &&
    JSON.stringify(initialSnapshot) !== JSON.stringify(currentSnapshot);

  useEffect(() => {
    if (!pricingDetail) {
      return;
    }

    const departmentIds = pricingDetail.departmentIds || [];
    const branchIds = pricingDetail.branchIds || [];
    const nextSchedule = getSchedule(pricingDetail);

    const values: OptionsFormValues = {
      departmentIds,
      branchIds,
      boardId: pricingDetail.boardId || '',
      pipelineId: pricingDetail.pipelineId || '',
    };

    reset(values);

    setSchedule(nextSchedule);
    setInitialSnapshot(getOptionsSnapshot({ values, schedule: nextSchedule }));
  }, [pricingDetail, reset]);

  useEffect(() => {
    if (!onSaveActionChange) {
      return;
    }

    onSaveActionChange(
      hasChanges ? (
        <Button
          type="submit"
          form={OPTIONS_FORM_ID}
          size="sm"
          disabled={loading}
        >
          {loading ? t('saving') : t('save-changes')}
        </Button>
      ) : null,
    );

    return () => onSaveActionChange(null);
  }, [hasChanges, loading, onSaveActionChange, t]);

  const handleBoardChange = (value: string) => {
    setValue('boardId', value, { shouldDirty: true });
    setValue('pipelineId', '', { shouldDirty: true });
  };

  const updateSchedule = (change: Partial<ScheduleState>) =>
    setSchedule((prev) => ({ ...prev, ...change }));

  const handleSave = async (values: OptionsFormValues) => {
    if (!pricingId) return;

    const departmentIds = values.departmentIds;
    const branchIds = values.branchIds;
    const boardId = values.boardId || null;
    const pipelineId = values.pipelineId || null;

    try {
      await editPricing({
        _id: pricingId,
        departmentIds,
        branchIds,
        boardId,
        pipelineId,
        stageId: null,
        isRepeatEnabled: schedule.activeWindows.length > 0,
        activeWindows: schedule.activeWindows.map(toWindowInput),
        closedDates: schedule.closedDates,
        scheduleMoment: schedule.scheduleMoment,
      });

      const savedValues: OptionsFormValues = {
        departmentIds,
        branchIds,
        boardId: boardId || '',
        pipelineId: pipelineId || '',
      };

      reset(savedValues);
      setInitialSnapshot(getOptionsSnapshot({ values: savedValues, schedule }));

      toast({
        title: t('options-updated'),
        description: t('changes-saved'),
      });
    } catch (error) {
      toast({
        title: t('failed-to-update-options'),
        description:
          error instanceof Error ? error.message : t('unexpected-error'),
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-6">
      <InfoCard title={t('options')}>
        <InfoCard.Content>
          <Form {...form}>
            <form
              id={OPTIONS_FORM_ID}
              onSubmit={handleSubmit(handleSave)}
              className="space-y-8"
              noValidate
            >
              <div className="flex items-center my-4">
                <div className="flex-1 border-t" />
                <Label className="mx-2">{t('location')}</Label>
                <div className="flex-1 border-t" />
              </div>

              <section className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Form.Field
                    control={control}
                    name="branchIds"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>{t('branches-caps')}</Form.Label>
                        <Form.Control>
                          <SelectBranches.FormItem
                            mode="multiple"
                            value={field.value}
                            onValueChange={field.onChange}
                          />
                        </Form.Control>
                      </Form.Item>
                    )}
                  />
                  <Form.Field
                    control={control}
                    name="departmentIds"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>{t('departments-caps')}</Form.Label>
                        <Form.Control>
                          <SelectDepartments.FormItem
                            mode="multiple"
                            value={field.value}
                            onValueChange={field.onChange}
                          />
                        </Form.Control>
                      </Form.Item>
                    )}
                  />
                </div>
              </section>

              <div className="flex items-center my-4">
                <div className="flex-1 border-t" />
                <Label className="mx-2">{t('pipeline')}</Label>
                <div className="flex-1 border-t" />
              </div>

              <section className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Form.Field
                    control={control}
                    name="boardId"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>{t('board-caps')}</Form.Label>
                        <Form.Control>
                          <SelectBoardFormItem
                            value={field.value}
                            onValueChange={handleBoardChange}
                            placeholder={t('choose-a-board')}
                          />
                        </Form.Control>
                      </Form.Item>
                    )}
                  />

                  <Form.Field
                    control={control}
                    name="pipelineId"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>{t('pipeline-caps')}</Form.Label>
                        <Form.Control>
                          <SelectPipelineFormItem
                            value={field.value}
                            onValueChange={field.onChange}
                            boardId={form.watch('boardId')}
                            placeholder={t('choose-a-pipeline')}
                          />
                        </Form.Control>
                      </Form.Item>
                    )}
                  />
                </div>
              </section>

              <div className="flex items-center my-4">
                <div className="flex-1 border-t" />
                <Label className="mx-2">{t('schedule')}</Label>
                <div className="flex-1 border-t" />
              </div>

              <ScheduleSection
                windows={schedule.activeWindows}
                closedDates={schedule.closedDates}
                scheduleMoment={schedule.scheduleMoment}
                onWindowsChange={(activeWindows) =>
                  updateSchedule({ activeWindows })
                }
                onClosedDatesChange={(closedDates) =>
                  updateSchedule({ closedDates })
                }
                onScheduleMomentChange={(scheduleMoment) =>
                  updateSchedule({ scheduleMoment })
                }
                blockedByPriority={!!pricingDetail?.priority}
              />
            </form>
          </Form>
        </InfoCard.Content>
      </InfoCard>
    </div>
  );
};
