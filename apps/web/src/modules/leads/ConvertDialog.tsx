import type { LeadRecordType } from '@erxes/core-contract';
import { memberQueries } from '@erxes/core-contract/client';
import { IconUserCheck } from '@tabler/icons-react';
import { Button, Dialog, Label, SelectMember, Spinner } from 'erxes-ui';
import { useId, useState } from 'react';
import { ContactSelect } from '~/modules/contacts/components/ContactPicker';
import { useLeadsT } from './i18n';
import { type LeadRecord, useConvertLeads } from './useLeads';

/** Who owns the converted leads; it starts as the lead's owner when there is one lead. */
const OwnerPicker = ({
  leads,
  value,
  onChange,
}: {
  leads: LeadRecord[];
  value: string | undefined;
  onChange: (ownerId: string | undefined) => void;
}) => {
  const t = useLeadsT();
  const id = useId();

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{t('actions.owner')}</Label>
      <SelectMember.Field
        id={id}
        value={value}
        members={memberQueries}
        onValueChange={(next) => onChange(next ?? undefined)}
        placeholder={leads.length === 1 ? t('actions.keep-owner') : t('actions.keep-owners')}
      />
    </div>
  );
};

const CompanyPicker = ({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (companyId: string | undefined) => void;
}) => {
  const t = useLeadsT();
  const id = useId();

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{t('actions.company')}</Label>
      <ContactSelect
        kind="company"
        id={id}
        value={value}
        onValueChange={onChange}
        noneLabel={t('actions.none')}
      />
    </div>
  );
};

type ConvertProps = {
  recordType: LeadRecordType;
  leads: LeadRecord[];
  onOpenChange: (open: boolean) => void;
  onDone?: () => void;
};

/** Mounted per opening, so the choices start from the leads each time. */
const ConvertForm = ({ recordType, leads, onOpenChange, onDone }: ConvertProps) => {
  const t = useLeadsT();
  const convert = useConvertLeads();
  const [only] = leads;

  const [ownerId, setOwnerId] = useState(
    leads.length === 1 ? (only?.ownerId ?? undefined) : undefined,
  );

  const [companyId, setCompanyId] = useState<string | undefined>();

  const submit = () =>
    convert.mutate(
      {
        recordType,
        ids: leads.map((lead) => lead.id),
        ownerId,
        companyId: recordType === 'customer' ? companyId : undefined,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          onDone?.();
        },
      },
    );

  return (
    <>
      <Dialog.Header>
        <Dialog.Title>
          {leads.length === 1
            ? t('actions.convert-one')
            : t('actions.convert-many', { count: leads.length })}
        </Dialog.Title>
        <Dialog.Description>
          {t('actions.convert-description', {
            list: recordType === 'company' ? t('companies') : t('actions.customers'),
          })}
        </Dialog.Description>
      </Dialog.Header>
      <div className="flex flex-col gap-3">
        <OwnerPicker leads={leads} value={ownerId} onChange={setOwnerId} />
        {recordType === 'customer' && <CompanyPicker value={companyId} onChange={setCompanyId} />}
      </div>
      <Dialog.Footer>
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={convert.isPending}>
          {t('actions.cancel')}
        </Button>
        <Button disabled={convert.isPending} onClick={submit}>
          {convert.isPending ? <Spinner size="sm" /> : <IconUserCheck />}
          {t('actions.convert')}
        </Button>
      </Dialog.Footer>
    </>
  );
};

/** Makes leads customers: who owns them from now on, and the company they belong to (both optional). */
export const ConvertDialog = ({ open, ...props }: ConvertProps & { open: boolean }) => (
  <Dialog open={open} onOpenChange={props.onOpenChange}>
    <Dialog.Content className="max-w-md">{open && <ConvertForm {...props} />}</Dialog.Content>
  </Dialog>
);
