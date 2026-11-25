import { IconX } from '@tabler/icons-react';
import { Button, Form } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { SelectCompany, SelectCustomer, SelectMember } from 'ui-modules';
import {
  REPORT_CONTACT_FIELDS,
  REPORT_FILTER_DEFINITIONS,
} from '../types/reportFilters';

type ReportContactField = (typeof REPORT_CONTACT_FIELDS)[number];

export const ReportContactSelect = ({
  name,
  value,
  onChange,
}: {
  name: ReportContactField;
  value?: string;
  onChange: (value: string) => void;
}) => {
  const { t } = useTranslation('accounting');
  const SelectContact = {
    customerId: SelectCustomer.FormItem,
    companyId: SelectCompany,
    customerUserId: SelectMember.FormItem,
  }[name];

  return (
    <Form.Item>
      <Form.Label>{t(REPORT_FILTER_DEFINITIONS[name].label)}</Form.Label>
      <div className="flex items-center gap-2">
        <SelectContact
          key={value ?? ''}
          mode="single"
          value={value}
          onValueChange={(id) => onChange(typeof id === 'string' ? id : '')}
          className="min-w-0 flex-1"
        />
        {value && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label={t('clear')}
            onClick={() => onChange('')}
          >
            <IconX />
          </Button>
        )}
      </div>
    </Form.Item>
  );
};
