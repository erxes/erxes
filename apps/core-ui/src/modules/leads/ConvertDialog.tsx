import type { LeadRecordType } from '@erxes/core-contract';
import { IconBuilding, IconUserCheck } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Button, Combobox, Dialog, Label, Popover, Spinner } from 'erxes-ui';
import { useId, useState } from 'react';
import { messageOf, orpc } from '~/lib/api';
import { SelectContactContent } from '~/modules/contacts/components/ContactPicker';
import {
  SelectMemberContent,
  SelectMemberProvider,
  SelectMemberValue,
} from '~/modules/contacts/components/SelectMemberProvider';
import { useLeadsT } from './i18n';
import { type LeadRecord, useConvertLeads } from './useLeads';

const CompanyName = ({ id }: { id: string }) => {
  const company = useQuery(orpc.companies.get.queryOptions({ input: { id } }));

  if (company.error) {
    return <span className="truncate text-destructive">{messageOf(company.error)}</span>;
  }

  return <span className="truncate">{company.data?.primaryName ?? '…'}</span>;
};

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
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{t('actions.owner')}</Label>
      <SelectMemberProvider
        value={value}
        onValueChange={(next) => onChange(typeof next === 'string' ? next : undefined)}
        setOpen={setOpen}
      >
        <Popover open={open} onOpenChange={setOpen}>
          <Combobox.Trigger id={id} className="w-full shadow-xs">
            <SelectMemberValue
              placeholder={leads.length === 1 ? t('actions.keep-owner') : t('actions.keep-owners')}
            />
          </Combobox.Trigger>
          <Combobox.Content>
            <SelectMemberContent />
          </Combobox.Content>
        </Popover>
      </SelectMemberProvider>
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
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{t('actions.company')}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <Combobox.Trigger id={id} className="w-full shadow-xs">
          <span className="flex min-w-0 items-center gap-2">
            <IconBuilding className="size-4 shrink-0 text-muted-foreground" />
            {value ? (
              <CompanyName id={value} />
            ) : (
              <span className="text-muted-foreground">{t('actions.none')}</span>
            )}
          </span>
        </Combobox.Trigger>
        <Combobox.Content>
          <SelectContactContent
            kind="company"
            value={value ? [value] : []}
            onValueChange={(ids) => {
              onChange(ids.filter((item) => item !== value).at(-1));
              setOpen(false);
            }}
          />
        </Combobox.Content>
      </Popover>
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
