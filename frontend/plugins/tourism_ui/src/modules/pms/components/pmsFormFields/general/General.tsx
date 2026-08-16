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
        <InfoCard title={t('basic-information', 'Basic Information')}>
          <InfoCard.Content className="space-y-2">
            <Form.Field
              control={control}
              name="name"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>
                    {t('name', 'Name')} <span className="text-destructive">*</span>
                  </Form.Label>
                  <Form.Control>
                    <Input {...field} placeholder={t('write-here', 'Write here')} />
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
                  <Form.Label>{t('description', 'Description')}</Form.Label>
                  <Form.Control>
                    <Textarea {...field} placeholder={t('description-placeholder', 'Description...')} />
                  </Form.Control>
                  <Form.Message className="text-destructive" />
                </Form.Item>
              )}
            />
          </InfoCard.Content>
        </InfoCard>

        <InfoCard title={t('check-in-check-out-time', 'Check In Check Out Time')}>
          <InfoCard.Content>
            <CheckInCheckOutTime control={control} />
          </InfoCard.Content>
        </InfoCard>

        <InfoCard title={t('discount', 'Discount')}>
          <InfoCard.Content>
            <Discount control={control} />
          </InfoCard.Content>
        </InfoCard>

        <InfoCard title={t('lock', 'Lock')}>
          <InfoCard.Content>
            <Lock control={control} />
          </InfoCard.Content>
        </InfoCard>
      </div>
    </PmsFormFieldsLayout>
  );
};

export default General;
