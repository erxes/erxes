import { Control, useWatch } from 'react-hook-form';
import { Form, DatePicker, Switch, Label, cn } from 'erxes-ui';
import { TourCreateFormType } from '../constants/formSchema';
export const TourDateSchedulingField = ({
  control,
}: {
  control: Control<TourCreateFormType>;
}) => {
  const isFlexibleDate = useWatch({
    control,
    name: 'isFlexibleDate',
    defaultValue: false,
  });
  const isGroupTour = useWatch({
    control,
    name: 'isGroupTour',
    defaultValue: false,
  });
  const availableFrom = useWatch({ control, name: 'availableFrom' });
  return (
    <div className="space-y-6">
      <Form.Field
        control={control}
        name="isFlexibleDate"
        render={({ field }) => (
          <Form.Item className="flex gap-3 items-center space-y-0">
            <Form.Control>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </Form.Control>
            <div className="space-y-1">
              <Form.Label className="cursor-pointer">
                Flexible dates (anytime within range)
              </Form.Label>
              <Form.Description className="text-xs">
                {field.value
                  ? 'Customers can choose their start date within a range'
                  : 'Tour has specific start and end dates'}
              </Form.Description>
            </div>
          </Form.Item>
        )}
      />
      {!isFlexibleDate ? (
        <div className="space-y-4">
          <Form.Field
            control={control}
            name="isGroupTour"
            render={({ field }) => (
              <Form.Item className="flex gap-3 items-center space-y-0">
                <Form.Control>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </Form.Control>
                <div className="space-y-1">
                  <Form.Label className="cursor-pointer">
                    Group tour (multiple start dates)
                  </Form.Label>
                  <Form.Description className="text-xs">
                    {field.value
                      ? 'Create one tour per selected start date'
                      : 'Create a single tour date'}
                  </Form.Description>
                </div>
              </Form.Item>
            )}
          />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Form.Field
              control={control}
              name="startDate"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>
                    Start Date{isGroupTour ? 's' : ''}{' '}
                    <span className="text-destructive">*</span>
                  </Form.Label>
                  <Form.Control>
                    {isGroupTour ? (
                      <DatePicker
                        value={
                          Array.isArray(field.value)
                            ? field.value
                            : field.value instanceof Date
                              ? [field.value]
                              : undefined
                        }
                        onChange={field.onChange}
                        required={false}
                        defaultMonth={
                          Array.isArray(field.value)
                            ? field.value[0]
                            : field.value instanceof Date
                              ? field.value
                              : undefined
                        }
                        mode="multiple"
                      />
                    ) : (
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        defaultMonth={
                          field.value instanceof Date ? field.value : undefined
                        }
                        mode="single"
                      />
                    )}
                  </Form.Control>
                  <Form.Message className="text-destructive" />
                </Form.Item>
              )}
            />
            <Form.Field
              control={control}
              name="endDate"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>End Date (Auto-calculated)</Form.Label>
                  <Form.Control>
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      defaultMonth={
                        field.value instanceof Date ? field.value : undefined
                      }
                      mode="single"
                      disabled
                    />
                  </Form.Control>
                  <Form.Message className="text-destructive" />
                </Form.Item>
              )}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Flexible schedule</Label>
            <p className={cn('text-xs text-accent-foreground')}>
              Customers will select their start date within this available
              period
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Form.Field
              control={control}
              name="availableFrom"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>
                    Available from <span className="text-destructive">*</span>
                  </Form.Label>
                  <Form.Control>
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      defaultMonth={
                        field.value instanceof Date ? field.value : undefined
                      }
                      mode="single"
                    />
                  </Form.Control>
                  <Form.Message className="text-destructive" />
                </Form.Item>
              )}
            />
            <Form.Field
              control={control}
              name="availableTo"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>
                    Available until <span className="text-destructive">*</span>
                  </Form.Label>
                  <Form.Control>
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      defaultMonth={
                        (field.value instanceof Date
                          ? field.value
                          : undefined) ||
                        (availableFrom instanceof Date
                          ? availableFrom
                          : undefined)
                      }
                      mode="single"
                      fromDate={
                        availableFrom instanceof Date
                          ? availableFrom
                          : undefined
                      }
                    />
                  </Form.Control>
                  <Form.Message className="text-destructive" />
                </Form.Item>
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
};
