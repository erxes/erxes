import { Control, Controller } from 'react-hook-form';
import { Label, Switch, Select, Input } from 'erxes-ui';
import type { ScreenConfigFormData } from './ScreenConfig';

interface KitchenScreenProps {
  control: Control<ScreenConfigFormData>;
}

const showTypeOptions = [
  { value: 'all', label: 'All saved orders' },
  { value: 'paid', label: 'Paid all orders' },
  { value: 'defined', label: 'Defined orders only' },
];

const statusChangeOptions = [
  { value: 'manual', label: 'Manual' },
  { value: 'time', label: 'Time' },
];

export const KitchenScreen: React.FC<KitchenScreenProps> = ({ control }) => {
  return (
    <div className="space-y-4">
      <Controller
        name="kitchenIsActive"
        control={control}
        render={({ field }) => (
          <div className="flex gap-2 items-center">
            <Switch checked={field.value} onCheckedChange={field.onChange} />
            <Label>KITCHEN SCREEN</Label>
          </div>
        )}
      />

      <Controller
        name="kitchenIsActive"
        control={control}
        render={({ field }) =>
          field.value ? (
            <div className="pt-2 space-y-4">
              <Controller
                name="kitchenShowType"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label>SHOW TYPES</Label>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <Select.Trigger>
                        <Select.Value />
                      </Select.Trigger>
                      <Select.Content>
                        {showTypeOptions.map((opt) => (
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
                name="kitchenType"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label>STATUS CHANGE /LEAVE/</Label>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <Select.Trigger>
                        <Select.Value />
                      </Select.Trigger>
                      <Select.Content>
                        {statusChangeOptions.map((opt) => (
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
                name="kitchenType"
                control={control}
                render={({ field }) =>
                  field.value === 'time' ? (
                    <Controller
                      name="kitchenValue"
                      control={control}
                      render={({ field }) => (
                        <div className="space-y-2">
                          <Label>TIME (MINUTE)</Label>
                          <Input
                            type="number"
                            {...field}
                            value={field.value || ''}
                            placeholder="Enter time in minutes"
                          />
                        </div>
                      )}
                    />
                  ) : (
                    <></>
                  )
                }
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
