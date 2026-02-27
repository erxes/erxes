import { Control, useWatch } from 'react-hook-form';
import { Form, Label, Select, Switch } from 'erxes-ui';
import { lockDurations } from '@/pms/constants/time.constants';
import { PmsBranchFormType } from '@/pms/constants/formSchema';

const Lock = ({ control }: { control: Control<PmsBranchFormType> }) => {
  const timeSwitch = useWatch({
    control,
    name: 'websiteReservationLock',
  });

  return (
    <div className="grid grid-cols-2 gap-6 mb-5">
      <Form.Field
        control={control}
        name={'websiteReservationLock'}
        render={({ field }) => (
          <div className="flex flex-col gap-3">
            <Label>Website Reservation Lock</Label>
            <Switch
              checked={Boolean(field.value)}
              onCheckedChange={field.onChange}
              className="w-10 h-6 [&_span]:size-4 [&_span]:data-[state=checked]:translate-x-[19px] rtl:[&_span]:data-[state=checked]:-translate-x-[19px]"
            />
          </div>
        )}
      />

      {timeSwitch && (
        <Form.Field
          control={control}
          name={'time'}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Reservation lock duration</Form.Label>
              <Form.Control>
                <Select value={field.value} onValueChange={field.onChange}>
                  <Select.Trigger>
                    <Select.Value placeholder="Choose lock duration" />
                  </Select.Trigger>
                  <Select.Content className="max-h-52">
                    {lockDurations.map((duration, index) => (
                      <Select.Item value={duration} key={index}>
                        {duration}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </Form.Control>
            </Form.Item>
          )}
        />
      )}
    </div>
  );
};

export default Lock;
