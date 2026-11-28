import type { Company, Customer } from '@erxes/core-contract';
import { Label } from 'erxes-ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCompany } from '../companies/useCompanies';
import { useCustomer } from '../customers/useCustomers';
import { ContactSelect } from './ContactPicker';
import { CompaniesMerge, CustomersMerge } from './ContactsMerge';

type ContactType = 'core:customer' | 'core:company';

const loaded = <Row,>(rows: (Row | undefined)[]) => rows.flatMap((row) => (row ? [row] : []));

/**
 * The record and the one picked to merge with it; the record itself first,
 * so it is the one kept unless changed.
 */
const useMergePair = (contentType: ContactType, contentId: string, otherId?: string) => {
  const isCustomer = contentType === 'core:customer';

  const customers: Customer[] = loaded([
    useCustomer(isCustomer ? contentId : null).data,
    useCustomer(isCustomer ? (otherId ?? null) : null).data,
  ]);

  const companies: Company[] = loaded([
    useCompany(isCustomer ? null : contentId).data,
    useCompany(isCustomer ? null : (otherId ?? null)).data,
  ]);

  return { customers, companies };
};

/**
 * Merge from a customer's or company's own page: pick the other record, then
 * the one to keep and each field's value. Kept elsewhere, the page moves to
 * the kept record.
 */
export const ContactMergeDialog = ({
  contentType,
  contentId,
  open,
  onOpenChange,
  onMerged,
}: {
  contentType: ContactType;
  contentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMerged: (keptId: string) => void;
}) => {
  const { t } = useTranslation('contact');
  const pickerId = useId();
  const kind = contentType === 'core:customer' ? 'customer' : 'company';
  const [otherId, setOtherId] = useState<string>();
  const { customers, companies } = useMergePair(contentType, contentId, otherId);

  const changeOpen = (next: boolean) => {
    if (!next) setOtherId(undefined);

    onOpenChange(next);
  };

  const picker = (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={pickerId}>{t('merge.with', 'Merge with')}</Label>
      <ContactSelect
        id={pickerId}
        kind={kind}
        value={otherId}
        onValueChange={(next) => setOtherId(next === contentId ? undefined : next)}
        noneLabel={t(`merge.pick.${kind}`)}
      />
    </div>
  );

  const merged = (keptId: string) => {
    changeOpen(false);
    onMerged(keptId);
  };

  return kind === 'customer' ? (
    <CustomersMerge
      records={otherId ? customers : []}
      open={open}
      onOpenChange={changeOpen}
      picker={picker}
      onMerged={merged}
    />
  ) : (
    <CompaniesMerge
      records={otherId ? companies : []}
      open={open}
      onOpenChange={changeOpen}
      picker={picker}
      onMerged={merged}
    />
  );
};
