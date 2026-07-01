import { Form, Input } from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
import {
  BOARD_NAMES_CONFIGS,
  BOARD_NUMBERS,
} from '@/pipelines/constants/pipelines';
import Attribution from './Attribution';
import { useTranslation } from 'react-i18next';
import { TUpdatePipelineForm } from '@/pipelines/types';

const PipelineConfig = ({
  form,
}: {
  form: UseFormReturn<TUpdatePipelineForm>;
}) => {
  const { control } = form;
  const { t } = useTranslation('frontline');

  return (
    <>
      <div className="flex flex-wrap gap-4 justify-between mb-4">
        <Form.Field
          control={control as any}
          name="numberConfig"
          render={({ field }) => (
            <Form.Item className="flex-1">
              <div className="flex justify-between items-center">
                <Form.Label>{t('number-configuration')}</Form.Label>
                <Attribution
                  config={BOARD_NUMBERS}
                  onChange={field.onChange}
                  value={field.value ?? ''}
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
          control={control as any}
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
        control={control as any}
        name="nameConfig"
        render={({ field }) => (
          <Form.Item>
            <div className="flex justify-between items-center">
              <Form.Label>{t('name-configuration')}</Form.Label>
              <Attribution
                config={BOARD_NAMES_CONFIGS}
                onChange={field.onChange}
                value={field.value ?? ''}
              />
            </div>
            <Form.Control>
              <Input {...field} placeholder={t('enter-name-configuration')} />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
    </>
  );
};

export default PipelineConfig;
