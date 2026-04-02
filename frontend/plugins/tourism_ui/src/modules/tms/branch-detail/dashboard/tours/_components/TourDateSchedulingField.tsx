import { useCallback, useMemo } from 'react';
import { Control, UseFormSetValue, useController } from 'react-hook-form';
import { Form, Switch } from 'erxes-ui';
import { RHFDatePicker } from './RHFDatePicker';
import { TourCreateFormType } from '../constants/formSchema';

type Props = {
  control: Control<TourCreateFormType>;
  setValue: UseFormSetValue<TourCreateFormType>;
};

export const TourDateSchedulingField = ({ control, setValue }: Props) => {
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

  const isFlexibleDate = flexibleField.value;
  const today = useMemo(() => new Date(), []);
  const isGroupTour = groupField.value;
  const availableFrom = availableFromField.value;

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
    <div className="space-y-6">
      <Form.Item className="flex gap-3 items-center space-y-0">
        <Switch
          checked={!!isFlexibleDate}
          onCheckedChange={handleFlexibleChange}
        />
        <div className="space-y-1">
          <Form.Label>Flexible dates (anytime within range)</Form.Label>
          <Form.Description className="text-xs">
            {isFlexibleDate
              ? 'Customers can choose their start date within a range'
              : 'Tour has specific start and end dates'}
          </Form.Description>
        </div>
      </Form.Item>

      {isFlexibleDate ? (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Form.Item>
              <Form.Label>
                Available from <span className="text-destructive">*</span>
              </Form.Label>
              <Form.Control>
                <RHFDatePicker
                  control={control}
                  name="availableFrom"
                  fromDate={today}
                />
              </Form.Control>
            </Form.Item>

            <Form.Item>
              <Form.Label>
                Available until <span className="text-destructive">*</span>
              </Form.Label>
              <Form.Control>
                <RHFDatePicker
                  control={control}
                  name="availableTo"
                  fromDate={availableFrom}
                />
              </Form.Control>
            </Form.Item>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Form.Item className="flex gap-3 items-center space-y-0">
            <Switch
              checked={!!isGroupTour}
              onCheckedChange={handleGroupChange}
            />
            <div className="space-y-1">
              <Form.Label>Group tour (multiple start dates)</Form.Label>
              <Form.Description className="text-xs">
                {isGroupTour
                  ? 'Create one tour per selected start date'
                  : 'Create a single tour date'}
              </Form.Description>
            </div>
          </Form.Item>

          <div className="grid gap-4 md:grid-cols-2">
            <Form.Item>
              <Form.Label>
                {isGroupTour ? 'Start Dates' : 'Start Date'}{' '}
                <span className="text-destructive">*</span>
              </Form.Label>

              {isGroupTour && (
                <Form.Description className="text-xs">
                  Select multiple available start dates for this group tour
                </Form.Description>
              )}

              <Form.Control>
                <RHFDatePicker
                  control={control}
                  name="startDate"
                  mode={isGroupTour ? 'multiple' : 'single'}
                  fromDate={today}
                />
              </Form.Control>
            </Form.Item>

            {!isGroupTour && (
              <Form.Item>
                <Form.Label>End Date</Form.Label>
                <Form.Control>
                  <RHFDatePicker control={control} name="endDate" disabled />
                </Form.Control>
              </Form.Item>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
