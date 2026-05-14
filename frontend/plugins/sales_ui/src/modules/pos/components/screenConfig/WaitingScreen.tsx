import { Control, Controller } from 'react-hook-form';
import { Label, Switch, Select, Input } from 'erxes-ui';
import type { ScreenConfigFormData } from './ScreenConfig';

interface WaitingScreenProps {
  control: Control<ScreenConfigFormData>;
}

const changeTypeOptions = [
  { value: 'time', label: 'Time' },
  { value: 'count', label: 'Count' },
];

export const WaitingScreen: React.FC<WaitingScreenProps> = ({ control }) => {
  return (
    <div className="space-y-4">
      <Controller
        name="waitingIsActive"
        control={control}
        render={({ field }) => (
          <div className="flex gap-2 items-center">
            <Switch checked={field.value} onCheckedChange={field.onChange} />
            <Label>WAITING SCREEN</Label>
          </div>
        )}
      />

      <Controller
        name="waitingIsActive"
        control={control}
        render={({ field }) =>
          field.value ? (
            <div className="pt-2 space-y-4">
              <Controller
                name="waitingType"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label>CHANGE TYPE</Label>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <Select.Trigger>
                        <Select.Value />
                      </Select.Trigger>
                      <Select.Content>
                        {changeTypeOptions.map((opt) => (
                          <Select.Item key={opt.value} value={opt.value}>
                            {opt.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </div>
                )}
              />

              <Controller
                name="waitingType"
                control={control}
                render={({ field: typeField }) => (
                  <Controller
                    name="waitingValue"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <Label>
                          {typeField.value === 'time'
                            ? 'CHANGE TIME (MIN)'
                            : 'CHANGE COUNT'}
                        </Label>
                        <Input
                          type="number"
                          {...field}
                          value={field.value || ''}
                          placeholder={
                            typeField.value === 'time'
                              ? 'Enter time in minutes'
                              : 'Enter count'
                          }
                        />
                      </div>
                    )}
                  />
                )}
              />

              <Controller
                name="waitingContentUrl"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label>CONTENT URL</Label>
                    <Input
                      type="text"
                      {...field}
                      value={field.value || ''}
                      placeholder="Enter content URL"
                    />
                  </div>
                )}
              />
            </div>
          ) : (
            <></>
          )
        }
      />
    </div>
  );
};
