import type { Company, Customer } from '@erxes/core-contract';
import { companyTitle, customerTitle, Label } from 'erxes-ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCompaniesMerge, useCompany } from '../companies/useCompanies';
import { useCustomer, useCustomersMerge } from '../customers/useCustomers';
import { ContactSelect } from './ContactPicker';
import { type MergeCandidate, MergeDialog } from './MergeDialog';

type ContactType = 'core:customer' | 'core:company';

/**
 * The record and the one picked to merge with it, as the dialog lists them;
 * the record itself first, so it is the one kept unless changed.
 */
const useMergePair = (
  contentType: ContactType,
  contentId: string,
  otherId?: string,
): MergeCandidate[] => {
  const { t } = useTranslation('contact');
  const isCustomer = contentType === 'core:customer';

  const customers = [
    useCustomer(isCustomer ? contentId : null).data,
    useCustomer(isCustomer ? (otherId ?? null) : null).data,
  ];

  const companies = [
    useCompany(isCustomer ? null : contentId).data,
    useCompany(isCustomer ? null : (otherId ?? null)).data,
  ];

  const lead = (record: Customer | Company) => (record.state === 'lead' ? t('lead._', 'Lead') : '');

  if (isCustomer) {
    return customers.flatMap((customer) =>
      customer
        ? [
            {
              id: customer.id,
              title: customerTitle(customer) || t('unnamed', 'Unnamed'),
              details: [customer.primaryEmail ?? '', customer.primaryPhone ?? '', lead(customer)],
            },
          ]
        : [],
    );
  }

  return companies.flatMap((company) =>
    company
      ? [
          {
            id: company.id,
            title: companyTitle(company) || t('unnamed', 'Unnamed'),
            details: [company.primaryEmail ?? '', company.website ?? '', lead(company)],
          },
        ]
      : [],
  );
};

/**
 * Merge from a customer's or company's own page: pick the other record, then
 * the one to keep. Kept elsewhere, the page moves to the kept record.
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
  const records = useMergePair(contentType, contentId, otherId);
  const mergeCustomers = useCustomersMerge();
  const mergeCompanies = useCompaniesMerge();
  const merge = kind === 'customer' ? mergeCustomers : mergeCompanies;

  const changeOpen = (next: boolean) => {
    if (!next) setOtherId(undefined);

    onOpenChange(next);
  };

  return (
    <MergeDialog
      open={open}
      onOpenChange={changeOpen}
      kind={kind}
      records={records}
      merging={merge.isPending}
      picker={
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
      }
      onMerge={(keepId) =>
        otherId &&
        merge.mutate(
          { ids: [contentId, otherId], keepId },
          {
            onSuccess: (kept) => {
              changeOpen(false);
              onMerged(kept.id);
            },
          },
        )
      }
    />
  );
};
