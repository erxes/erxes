import { useWatch } from 'react-hook-form';
import {
  BOARD_NAMES_CONFIGS,
  BOARD_NUMBERS,
} from '@/deals/constants/pipelines';
import { Checkbox, Form, Input } from 'erxes-ui';
import { SelectMember } from 'ui-modules';
import Attribution from './Attribution';
import { useTranslation } from 'react-i18next';


const PipelineConfig = ({ form }: { form: any }) => {
  const { control } = form;
  const [isCheckUser, isCheckDepartment] = useWatch({
    control: form.control,
    name: ['isCheckUser', 'isCheckDepartment'],
  });

  const { t } = useTranslation('sales');

  return (
    <>
      <div className="flex flex-wrap gap-4 justify-between mb-4">
        <Form.Field
          control={control}
          name="numberConfig"
          render={({ field }) => (
            <Form.Item className="flex-1">
              <div className="flex justify-between items-center">
                <Form.Label>{t('number-configuration')}</Form.Label>
                <Attribution
                  config={BOARD_NUMBERS}
                  onChange={field.onChange}
                  value={field.value}
                />
              </div>
              <Form.Control>
                <Input {...field} placeholder={t('enter-number-configuration')} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={control}
          name="numberSize"
          render={({ field }) => (
            <Form.Item className="w-48">
              <Form.Label>{t('fractional-part')}</Form.Label>
              <Form.Control>
                <Input {...field} placeholder="1-8" />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>

      <Form.Field
        control={control}
        name="nameConfig"
        render={({ field }) => (
          <Form.Item>
            <div className="flex justify-between items-center">
              <Form.Label>{t('name-configuration')}</Form.Label>
              <Attribution
                config={BOARD_NAMES_CONFIGS}
                onChange={field.onChange}
                value={field.value}
              />
            </div>
            <Form.Control>
              <Input {...field} placeholder={t('enter-name-configuration')} />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={control}
        name="isCheckDate"
        render={({ field }) => (
          <Form.Item className="flex flex-1 gap-3 items-center my-4">
            <Form.Label>{t('Select-day-after-card-created')}</Form.Label>
            <Form.Control>
              <Checkbox
                className="mt-0!"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={control}
        name="isCheckUser"
        render={({ field }) => (
          <Form.Item className="flex flex-1 gap-3 items-center my-4">
            <Form.Label>{t('show-only-user-assigned-deal')}</Form.Label>
            <Form.Control>
              <Checkbox
                className="mt-0!"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={control}
        name="isCheckDepartment"
        render={({ field }) => (
          <Form.Item className="flex flex-1 gap-3 items-center my-4">
            <Form.Label>
              {t('show-only-user-assigned-deal-by-department')}
            </Form.Label>
            <Form.Control>
              <Checkbox
                className="mt-0!"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />

      {(isCheckUser || isCheckDepartment) && (
        <Form.Field
          control={control}
          name="excludeCheckUserIds"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('user-see-all-deals')}</Form.Label>
              <SelectMember.FormItem
                mode="multiple"
                value={field.value}
                onValueChange={field.onChange}
              />
            </Form.Item>
          )}
        />
      )}
    </>
  );
};

export default PipelineConfig;
