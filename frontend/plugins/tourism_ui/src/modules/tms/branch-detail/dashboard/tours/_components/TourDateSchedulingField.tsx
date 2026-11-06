import { useCallback, useMemo } from 'react';
import {
  Control,
  FieldErrors,
  UseFormSetValue,
  useController,
  useFormState,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  IconCalendar,
  IconCalendarDue,
  IconCalendarEvent,
  IconCalendarRepeat,
  IconUsersGroup,
} from '@tabler/icons-react';
import { Switch } from 'erxes-ui';
import { PanelFormRow } from 'ui-modules';
import { TOURISM_PANEL_INPUT_CLASS_NAME } from '@/tms/side-panel/TourismPanelForm';
import { RHFDatePicker } from './RHFDatePicker';
import { TourFormValues } from '../constants/formSchema';

type Props = {
  control: Control<TourFormValues>;
  setValue: UseFormSetValue<TourFormValues>;
};

const toShortLabel = (label: string) => label.replace(/\s*\(.*\)\s*$/, '');

const getErrorMessage = (
  errors: FieldErrors<TourFormValues>,
  name: 'startDate' | 'availableFrom' | 'availableTo',
) => {
  const message = errors[name]?.message;

  return typeof message === 'string' ? message : undefined;
};

const SwitchRow = ({
  label,
  icon,
  checked,
  onCheckedChange,
}: {
  label: string;
  icon: typeof IconCalendar;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) => (
  <PanelFormRow
    label={<span title={label}>{toShortLabel(label)}</span>}
    icon={icon}
  >
    <div className="flex h-7 items-center px-2">
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  </PanelFormRow>
);

export const TourDateSchedulingField = ({ control, setValue }: Props) => {
  const { t } = useTranslation('tourism');
  const { errors } = useFormState({
    control,
    name: ['startDate', 'availableFrom', 'availableTo'],
  });
  const { field: flexibleField } = useController({
    control,
    name: 'isFlexibleDate',
    defaultValue: false,
  });
  const { field: groupField } = useController({
    control,
    name: 'isGroupTour',
    defaultValue: false,
  });
  const { field: availableFromField } = useController({
    control,
    name: 'availableFrom',
  });

  const isFlexibleDate = !!flexibleField.value;
  const isGroupTour = !!groupField.value;
  const today = useMemo(() => new Date(), []);

  const handleFlexibleChange = useCallback(
    (checked: boolean) => {
      flexibleField.onChange(checked);

      if (checked) {
        setValue('startDate', undefined);
        setValue('endDate', undefined);
        setValue('isGroupTour', false);
      } else {
        setValue('availableFrom', undefined);
        setValue('availableTo', undefined);
      }
    },
    [flexibleField, setValue],
  );

  const handleGroupChange = useCallback(
    (checked: boolean) => {
      groupField.onChange(checked);
      setValue('startDate', undefined);
      setValue('endDate', undefined);
    },
    [groupField, setValue],
  );

  return (
    <>
      <SwitchRow
        label={t('flexible-dates')}
        icon={IconCalendarEvent}
        checked={isFlexibleDate}
        onCheckedChange={handleFlexibleChange}
      />

      {isFlexibleDate ? (
        <>
          <PanelFormRow
            label={t('available-from')}
            icon={IconCalendar}
            required
            error={getErrorMessage(errors, 'availableFrom')}
          >
            <RHFDatePicker
              className={TOURISM_PANEL_INPUT_CLASS_NAME}
              control={control}
              name="availableFrom"
              fromDate={today}
            />
          </PanelFormRow>
          <PanelFormRow
            label={t('available-until-label')}
            icon={IconCalendarDue}
            required
            error={getErrorMessage(errors, 'availableTo')}
          >
            <RHFDatePicker
              className={TOURISM_PANEL_INPUT_CLASS_NAME}
              control={control}
              name="availableTo"
              fromDate={availableFromField.value}
            />
          </PanelFormRow>
        </>
      ) : (
        <>
          <SwitchRow
            label={t('group-tour')}
            icon={IconUsersGroup}
            checked={isGroupTour}
            onCheckedChange={handleGroupChange}
          />
          <PanelFormRow
            label={isGroupTour ? t('start-dates') : t('start-date')}
            icon={isGroupTour ? IconCalendarRepeat : IconCalendar}
            required
            error={getErrorMessage(errors, 'startDate')}
          >
            <RHFDatePicker
              className={TOURISM_PANEL_INPUT_CLASS_NAME}
              control={control}
              name="startDate"
              mode={isGroupTour ? 'multiple' : 'single'}
              fromDate={today}
            />
          </PanelFormRow>
          {!isGroupTour && (
            <PanelFormRow label={t('end-date')} icon={IconCalendarDue}>
              <RHFDatePicker
                className={TOURISM_PANEL_INPUT_CLASS_NAME}
                control={control}
                name="endDate"
                disabled
              />
            </PanelFormRow>
          )}
        </>
      )}
    </>
  );
};
