import { Form, Input } from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
import {
  BOARD_NAMES_CONFIGS,
  BOARD_NUMBERS,
} from '@/pipelines/constants/pipelines';
import { PipelineSection } from '@/pipelines/components/PipelineSection';
import { Attribution } from '@/pipelines/components/Attribution';
import { TicketNumberPreview } from '@/pipelines/components/TicketNumberPreview';
import { useTranslation } from 'react-i18next';
import { TUpdatePipelineForm } from '@/pipelines/types';

export const PipelineConfig = ({
  form,
}: {
  form: UseFormReturn<TUpdatePipelineForm>;
}) => {
  const { control } = form;
  const { t } = useTranslation('frontline');
  const [numberConfig, numberSize, nameConfig] = form.watch([
    'numberConfig',
    'numberSize',
    'nameConfig',
  ]);

  return (
    <>
      <PipelineSection title={t('number')}>
        <div className="flex items-start gap-2">
          <Form.Field
            control={control}
            name="numberConfig"
            render={({ field }) => (
              <Form.Item className="min-w-0 flex-1 space-y-1">
                <Form.Label className="sr-only">
                  {t('number-configuration')}
                </Form.Label>
                <Form.Control>
                  <Input {...field} placeholder="{year}-" />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            control={control}
            name="numberSize"
            render={({ field }) => (
              <Form.Item className="w-16 flex-none space-y-1">
                <Form.Label className="sr-only">
                  {t('fractional-part')}
                </Form.Label>
                <Form.Control>
                  <Input {...field} placeholder="1-8" />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
          <Attribution
            config={BOARD_NUMBERS}
            onChange={(value) =>
              form.setValue('numberConfig', value, { shouldDirty: true })
            }
            value={numberConfig ?? ''}
          />
        </div>
        <TicketNumberPreview
          numberConfig={numberConfig}
          numberSize={numberSize}
        />
      </PipelineSection>

      <PipelineSection title={t('name')}>
        <div className="flex items-start gap-2">
          <Form.Field
            control={control}
            name="nameConfig"
            render={({ field }) => (
              <Form.Item className="min-w-0 flex-1 space-y-1">
                <Form.Label className="sr-only">
                  {t('name-configuration')}
                </Form.Label>
                <Form.Control>
                  <Input {...field} placeholder="{customer.firstName}" />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />
          <Attribution
            config={BOARD_NAMES_CONFIGS}
            onChange={(value) =>
              form.setValue('nameConfig', value, { shouldDirty: true })
            }
            value={nameConfig ?? ''}
          />
        </div>
      </PipelineSection>
    </>
  );
};
