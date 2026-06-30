import { Control } from 'react-hook-form';
import { Form, Input, Textarea, InfoCard } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import PmsFormFieldsLayout from '../PmsFormFieldsLayout';
import CheckInCheckOutTime from './CheckInCheckOutTime';
import Discount from './Discount';
import Lock from './Lock';
import { PmsBranchFormType } from '@/pms/constants/formSchema';

const General = ({ control }: { control: Control<PmsBranchFormType> }) => {
  const { t } = useTranslation('tourism');
  return (
    <PmsFormFieldsLayout>
      <div className="space-y-3">
        <InfoCard title={t('basic-information')}>
          <InfoCard.Content className="space-y-2">
            <Form.Field
              control={control}
              name="name"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>
                    {t('name')} <span className="text-destructive">*</span>
                  </Form.Label>
                  <Form.Control>
                    <Input {...field} placeholder={t('write-here')} />
                  </Form.Control>
                  <Form.Message className="text-destructive" />
                </Form.Item>
              )}
            />

            <Form.Field
              control={control}
              name="description"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('description')}</Form.Label>
                  <Form.Control>
                    <Textarea {...field} placeholder={t('description-placeholder')} />
                  </Form.Control>
                  <Form.Message className="text-destructive" />
                </Form.Item>
              )}
            />
          </InfoCard.Content>
        </InfoCard>

        <InfoCard title={t('check-in-check-out-time')}>
          <InfoCard.Content>
            <CheckInCheckOutTime control={control} />
          </InfoCard.Content>
        </InfoCard>

        <InfoCard title={t('discount')}>
          <InfoCard.Content>
            <Discount control={control} />
          </InfoCard.Content>
        </InfoCard>

        <InfoCard title={t('lock')}>
          <InfoCard.Content>
            <Lock control={control} />
          </InfoCard.Content>
        </InfoCard>
      </div>
    </PmsFormFieldsLayout>
  );
};

export default General;
