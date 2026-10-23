import {
  IconArrowUpRight,
  IconChevronDown,
  IconPencil,
  IconPlus,
} from '@tabler/icons-react';
import {
  Avatar,
  Button,
  cn,
  Combobox,
  Popover,
  PopoverScoped,
  readImage,
  Skeleton,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSidePanel } from '../../widget/record-side-panel/useSidePanel';
import { useCompanyInline } from '../hooks/useCompanyInline';
import { useCustomerInline } from '../hooks/useCustomers';
import { SelectCompany } from './SelectCompany';
import { SelectCustomer } from './SelectCustomer';

type TContactKind = 'customer' | 'company';

const CONTENT_TYPES: Record<TContactKind, string> = {
  customer: 'core:customer',
  company: 'core:company',
};

// One linked record: its avatar and name; clicking opens it in the panel.
const RelationChip = ({
  name,
  avatar,
  onOpen,
}: {
  name: string;
  avatar?: string;
  onOpen: () => void;
}) => (
  <button
    type="button"
    onClick={onOpen}
    title={name}
    data-panel-inline=""
    className="group/chip inline-flex h-6 max-w-full items-center gap-1 rounded-sm bg-muted px-1.5 text-xs font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  >
    <Avatar className="size-4 flex-none">
      <Avatar.Image src={readImage(avatar)} />
      <Avatar.Fallback className="text-[10px]">
        {name.charAt(0)}
      </Avatar.Fallback>
    </Avatar>
    <span className="truncate">{name}</span>
    {/* It opens the record: say so on hover. */}
    <IconArrowUpRight className="size-3 flex-none text-muted-foreground opacity-0 transition-opacity group-hover/chip:opacity-100 group-focus-visible/chip:opacity-100" />
  </button>
);

const ChipSkeleton = () => <Skeleton className="h-5 w-20 rounded-sm" />;

const CustomerChip = ({
  customerId,
  onOpen,
}: {
  customerId: string;
  onOpen: () => void;
}) => {
  const { customer, loading } = useCustomerInline({
    variables: { _id: customerId },
  });

  if (loading && !customer) {
    return <ChipSkeleton />;
  }

  const { firstName, lastName, primaryEmail, primaryPhone, avatar } =
    customer || {};
  const name =
    [firstName, lastName].filter(Boolean).join(' ') ||
    primaryEmail ||
    primaryPhone ||
    customerId;

  return <RelationChip name={name} avatar={avatar} onOpen={onOpen} />;
};

const CompanyChip = ({
  companyId,
  onOpen,
}: {
  companyId: string;
  onOpen: () => void;
}) => {
  const { companyDetail, loading } = useCompanyInline({
    variables: { _id: companyId },
  });

  if (loading && !companyDetail) {
    return <ChipSkeleton />;
  }

  const { primaryName, primaryEmail, primaryPhone, avatar } =
    companyDetail || {};
  const name = primaryName || primaryEmail || primaryPhone || companyId;

  return <RelationChip name={name} avatar={avatar} onOpen={onOpen} />;
};

// A linked customer or company as a chip; clicking it calls `onOpen`.
export const ContactRecordChip = ({
  kind,
  id,
  onOpen,
}: {
  kind: TContactKind;
  id: string;
  onOpen: () => void;
}) =>
  kind === 'customer' ? (
    <CustomerChip customerId={id} onOpen={onOpen} />
  ) : (
    <CompanyChip companyId={id} onOpen={onOpen} />
  );

/**
 * A record's one customer or company, as a relation field:
 * each shows as a chip that opens it in the side panel, and the pencil (or
 * "Add") opens the usual customer / company picker to change the selection.
 * `variant="chip"` draws it like `Combobox.ChipTrigger`, with its `label`,
 * for forms laid out as a row of those.
 */
export const ContactsRelationField = ({
  kind,
  value,
  onValueChange,
  scope,
  variant = 'inline',
  label,
  onOpen,
}: {
  kind: TContactKind;
  // The record's one customer or company.
  value?: string | null;
  onValueChange: (value: string | null) => void;
  scope?: string;
  variant?: 'inline' | 'chip';
  label?: string;
  // Opens the linked contact somewhere else than the side panel, e.g. the
  // sheet's own rail where the panel cannot be reached.
  onOpen?: (contactId: string) => void;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });
  const { openRecord } = useSidePanel();
  const [open, setOpen] = useState(false);

  const openContact = (contentId: string) =>
    onOpen
      ? onOpen(contentId)
      : // Opened from inside the panel: Back returns to this record.
        openRecord(
          { contentType: CONTENT_TYPES[kind], contentId },
          { stack: true },
        );

  const selected = value ? [value] : [];

  const handleChange = (next: string[] | string) => {
    onValueChange((Array.isArray(next) ? next[0] : next) || null);
    setOpen(false);
  };

  const addLabel =
    kind === 'customer'
      ? t('add-customer', 'Add customer')
      : t('add-company', 'Add company');

  const picker =
    kind === 'customer' ? (
      <SelectCustomer.Provider
        mode="single"
        value={value || ''}
        onValueChange={handleChange}
      >
        <SelectCustomer.Content />
      </SelectCustomer.Provider>
    ) : (
      <SelectCompany.Provider
        mode="single"
        value={value || ''}
        onValueChange={handleChange}
      >
        <SelectCompany.Content />
      </SelectCompany.Provider>
    );

  const chips = selected.map((id) =>
    kind === 'customer' ? (
      <CustomerChip key={id} customerId={id} onOpen={() => openContact(id)} />
    ) : (
      <CompanyChip key={id} companyId={id} onOpen={() => openContact(id)} />
    ),
  );

  if (variant === 'chip') {
    return (
      <div className="group flex h-7 w-fit max-w-full items-center overflow-hidden rounded border bg-background text-sm shadow-xs has-data-[state=open]:border-primary/40">
        {label && (
          <span className="flex h-full shrink-0 items-center whitespace-nowrap border-r bg-muted/40 px-3 text-muted-foreground">
            {label}
          </span>
        )}
        {selected.length > 0 && (
          <div className="flex min-w-0 items-center gap-1 overflow-hidden pl-1.5">
            {chips}
          </div>
        )}
        <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Button
              variant="ghost"
              aria-label={addLabel}
              className={cn(
                'group/trigger h-full shrink-0 gap-1.5 rounded-none font-medium',
                selected.length ? 'px-2' : 'pl-3 pr-2.5',
              )}
            >
              {!selected.length && (
                <span className="text-muted-foreground">
                  {t('not-specified', 'Not specified')}
                </span>
              )}
              <IconChevronDown className="size-3.5 text-muted-foreground transition-transform group-data-[state=open]/trigger:rotate-180" />
            </Button>
          </Popover.Trigger>
          <Combobox.Content>{picker}</Combobox.Content>
        </PopoverScoped>
      </div>
    );
  }

  return (
    <div className="group flex min-h-7 flex-wrap items-center gap-1 px-1">
      {chips}
      <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          {selected.length ? (
            <Button
              variant="ghost"
              size="icon"
              aria-label={addLabel}
              data-panel-inline=""
              className="size-6 text-muted-foreground opacity-0 group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
            >
              <IconPencil className="size-3.5" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              data-panel-inline=""
              className="h-6 px-1 text-xs font-normal text-muted-foreground"
            >
              <IconPlus className="size-3.5" />
              {addLabel}
            </Button>
          )}
        </Popover.Trigger>
        <Combobox.Content>{picker}</Combobox.Content>
      </PopoverScoped>
    </div>
  );
};
