import { Control } from 'react-hook-form';
import { Form, Input, Select } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { times } from '@/pms/constants/time.constants';
import { PmsBranchFormType } from '@/pms/constants/formSchema';

const CheckInCheckOutTime = ({
  control,
}: {
  control: Control<PmsBranchFormType>;
}) => {
  const { t } = useTranslation('tourism');
  return (
    <div className="grid grid-cols-2 gap-2">
      <Form.Field
        control={control}
        name="checkInTime"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>
              {t('check-in-time')} <span className="text-destructive">*</span>
            </Form.Label>
            <Form.Control>
              <Select value={field.value} onValueChange={field.onChange}>
                <Select.Trigger>
                  <Select.Value placeholder={t('choose-check-in-time')} />
                </Select.Trigger>
                <Select.Content className="max-h-52">
                  {times.map((time, index) => (
                    <Select.Item value={time} key={index}>
                      {time}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </Form.Control>
            <Form.Message className="text-destructive" />
          </Form.Item>
        )}
      />

      <Form.Field
        control={control}
        name="checkInAmount"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>
              {t('check-in-amount')} <span className="text-destructive">*</span>
            </Form.Label>
            <Form.Control>
              <Input
                {...field}
                placeholder={t('check-in-amount')}
                type="number"
                min={0}
                value={field.value ?? ''}
                onChange={(e) => {
                  const next = e.target.value;
                  field.onChange(next === '' ? 0 : Number(next));
                }}
              />
            </Form.Control>
            <Form.Message className="text-destructive" />
          </Form.Item>
        )}
      />

      <Form.Field
        control={control}
        name="checkOutTime"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>
              {t('check-out-time')} <span className="text-destructive">*</span>
            </Form.Label>
            <Form.Control>
              <Select value={field.value} onValueChange={field.onChange}>
                <Select.Trigger>
                  <Select.Value placeholder={t('choose-check-in-time')} />
                </Select.Trigger>
                <Select.Content className="max-h-52">
                  {times.map((time, index) => (
                    <Select.Item value={time} key={index}>
                      {time}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </Form.Control>
            <Form.Message className="text-destructive" />
          </Form.Item>
        )}
      />

      <Form.Field
        control={control}
        name="checkOutAmount"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>
              {t('check-out-amount')} <span className="text-destructive">*</span>
            </Form.Label>
            <Form.Control>
              <Input
                {...field}
                placeholder={t('check-out-amount')}
                type="number"
                min={0}
                value={field.value ?? ''}
                onChange={(e) => {
                  const next = e.target.value;
                  field.onChange(next === '' ? 0 : Number(next));
                }}
              />
            </Form.Control>
            <Form.Message className="text-destructive" />
          </Form.Item>
        )}
      />
    </div>
  );
};

export default CheckInCheckOutTime;
