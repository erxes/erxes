import { ContactPanelTags } from '@/side-panel/components/details/ContactPanelTags';
import { ContactDescriptionField } from '@/side-panel/components/details/ContactPanelDescription';
import { ContactDetailSection } from '@/side-panel/components/details/ContactDetailSection';
import {
  ContactPanelWebsiteLink,
  getWebsiteUrl,
} from '@/side-panel/components/details/ContactPanelActions';
import { ContactPanelRelationField } from '@/side-panel/components/details/ContactPanelRelationField';
import {
  type Icon,
  IconBell,
  IconBrandFacebook,
  IconBrandGithub,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandX,
  IconBrandYoutube,
  IconBriefcase,
  IconCalendar,
  IconCircle,
  IconGenderBigender,
  IconHash,
  IconMail,
  IconPhone,
  IconPlus,
  IconSitemap,
  IconUser,
  IconWorld,
} from '@tabler/icons-react';
import { useChangeCustomerState } from '@/contacts/customers/hooks/useChangeCustomerState';
import { format } from 'date-fns';
import {
  Button,
  cn,
  DatePicker,
  DropdownMenu,
  Popover,
  PopoverScoped,
  RecordTableInlineCell,
  ScrollArea,
  Select,
  SexCode,
  SexCodes,
  SexDisplay,
  SexField,
  Spinner,
  Switch,
  TextField,
  toast,
} from 'erxes-ui';
import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CustomerEmails,
  SelectMember,
  CustomerPhones,
  ICustomerDetail,
  useCustomerDetail,
  useCustomerEdit,
  usePanelExpanded,
  PANEL_TEXT_FIELD_CLASS_NAME,
  PanelField,
  PanelFieldTrigger,
} from 'ui-modules';

const SCOPE = 'side-panel-customer';

// The phone cell, like the list, marks only valid and invalid numbers.
const toCellPhoneStatus = (status: ICustomerDetail['phoneValidationStatus']) =>
  status === 'valid' || status === 'invalid' ? status : undefined;

type TTextCode = 'code' | 'position' | 'department';

const TEXT_FIELD_ICONS: Record<TTextCode, Icon> = {
  code: IconHash,
  position: IconBriefcase,
  department: IconSitemap,
};

const CustomerTextField = ({
  customer,
  code,
  placeholder,
}: {
  customer: ICustomerDetail;
  code: TTextCode;
  placeholder: string;
}) => {
  const { customerEdit } = useCustomerEdit();
  const value = customer[code] || '';
  const FieldIcon = TEXT_FIELD_ICONS[code];

  return (
    <TextField
      scope={`${SCOPE}.${code}`}
      value={value}
      placeholder={placeholder}
      className={cn(
        PANEL_TEXT_FIELD_CLASS_NAME,
        !value && 'text-muted-foreground',
      )}
      onSave={(next) =>
        customerEdit({ variables: { _id: customer._id, [code]: next } })
      }
    >
      {!value && (
        <FieldIcon
          className="size-3.5 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
      )}
    </TextField>
  );
};

type TLinkCode =
  | 'website'
  | 'facebook'
  | 'instagram'
  | 'twitter'
  | 'linkedIn'
  | 'youtube'
  | 'github';

const CUSTOMER_LINKS: { code: TLinkCode; icon: Icon; label?: string }[] = [
  { code: 'website', icon: IconWorld },
  { code: 'facebook', icon: IconBrandFacebook, label: 'Facebook' },
  { code: 'instagram', icon: IconBrandInstagram, label: 'Instagram' },
  { code: 'twitter', icon: IconBrandX, label: 'X (Twitter)' },
  { code: 'linkedIn', icon: IconBrandLinkedin, label: 'LinkedIn' },
  { code: 'youtube', icon: IconBrandYoutube, label: 'YouTube' },
  { code: 'github', icon: IconBrandGithub, label: 'GitHub' },
];

const CustomerLinksSection = ({ customer }: { customer: ICustomerDetail }) => {
  const { t } = useTranslation('contact', { keyPrefix: 'customer' });
  const { t: sectionT } = useTranslation('common', { keyPrefix: 'side-panel' });
  const { customerEdit, loading } = useCustomerEdit();
  const [addedCodes, setAddedCodes] = useState<TLinkCode[]>([]);
  const links: Partial<Record<TLinkCode, string>> = { ...customer.links };
  const isShown = (code: TLinkCode) =>
    Boolean(links[code]) || addedCodes.includes(code);
  const shownLinks = CUSTOMER_LINKS.filter(({ code }) => isShown(code));
  const hiddenLinks = CUSTOMER_LINKS.filter(({ code }) => !isShown(code));

  return (
    <ContactDetailSection title={sectionT('links')} nested>
      {shownLinks.map(({ code, icon, label }) => {
        const value = links[code] || '';

        return (
          <PanelField key={code} icon={icon} label={label ?? t('website')}>
            <div className="flex min-w-0 items-center gap-1">
              <TextField
                scope={`${SCOPE}.links.${code}`}
                value={value}
                placeholder="https://"
                defaultOpen={!value}
                disabled={loading}
                className={cn(
                  PANEL_TEXT_FIELD_CLASS_NAME,
                  'min-w-0 flex-1',
                  !value && 'text-muted-foreground',
                )}
                onSave={(next) => {
                  const link = next.trim();

                  if (link && !getWebsiteUrl(link)) {
                    toast({
                      title: t('invalid-link'),
                      variant: 'destructive',
                    });
                    return;
                  }

                  customerEdit({
                    variables: {
                      _id: customer._id,
                      links: { ...links, [code]: link },
                    },
                  });
                }}
              />
              <ContactPanelWebsiteLink website={value} />
            </div>
          </PanelField>
        );
      })}
      {hiddenLinks.length > 0 && (
        <DropdownMenu>
          <DropdownMenu.Trigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-fit px-2 text-xs font-normal text-muted-foreground"
            >
              <IconPlus className="size-3.5" aria-hidden="true" />
              {t('add-link')}
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content
            align="start"
            onCloseAutoFocus={(event) => event.preventDefault()}
          >
            {hiddenLinks.map(({ code, icon: LinkIcon, label }) => (
              <DropdownMenu.Item
                key={code}
                onSelect={() => setAddedCodes((prev) => [...prev, code])}
              >
                <LinkIcon className="size-4" aria-hidden="true" />
                {label ?? t('website')}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu>
      )}
    </ContactDetailSection>
  );
};

/** Edits the customer pronoun and closes its picker after selection. */
const CustomerSexField = ({ customer }: { customer: ICustomerDetail }) => {
  const { customerEdit } = useCustomerEdit();
  const [open, setOpen] = useState(false);

  return (
    <PopoverScoped scope={`${SCOPE}.sex`} open={open} onOpenChange={setOpen}>
      <PanelFieldTrigger>
        <SexDisplay value={customer.sex as SexCode} />
      </PanelFieldTrigger>
      <RecordTableInlineCell.Content>
        <SexField
          value={customer.sex as SexCode}
          onValueChange={(sex) => {
            if (sex !== customer.sex) {
              customerEdit({ variables: { _id: customer._id, sex } });
            }
            setOpen(false);
          }}
        />
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};

/** Saves a changed birth date when the date picker closes. */
const CustomerBirthDateField = ({
  customer,
}: {
  customer: ICustomerDetail;
}) => {
  const { customerEdit } = useCustomerEdit();
  const [open, setOpen] = useState(false);
  const saved = customer.birthDate ? new Date(customer.birthDate) : undefined;
  const [date, setDate] = useState(saved);

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next && date && date.getTime() !== saved?.getTime()) {
          customerEdit({ variables: { _id: customer._id, birthDate: date } });
        }
      }}
    >
      <PanelFieldTrigger>
        {date ? (
          format(date, 'yyyy/MM/dd')
        ) : (
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <IconCalendar className="size-3.5" aria-hidden="true" />
            YYYY/MM/DD
          </span>
        )}
      </PanelFieldTrigger>
      <RecordTableInlineCell.Content className="w-auto">
        <DatePicker
          defaultMonth={date}
          value={date}
          onChange={(next) => setDate(next as Date)}
        />
      </RecordTableInlineCell.Content>
    </Popover>
  );
};

/** Switches the contact between lead and customer states. */
const CustomerStateField = ({ customer }: { customer: ICustomerDetail }) => {
  const { t } = useTranslation('contact', { keyPrefix: 'customer' });
  const { changeCustomerState } = useChangeCustomerState();

  return (
    <Select
      value={customer.state || ''}
      onValueChange={(state) => changeCustomerState([customer._id], state)}
    >
      <Select.Trigger className="h-7 rounded-sm px-2 shadow-none hover:bg-accent">
        <Select.Value placeholder={t('state', 'State')} />
      </Select.Trigger>
      <Select.Content align="start">
        <Select.Item value="lead">{t('lead', 'Lead')}</Select.Item>
        <Select.Item value="customer">{t('customer', 'Customer')}</Select.Item>
      </Select.Content>
    </Select>
  );
};

/** Maps the subscription switch to the stored Yes/No values. */
const CustomerSubscribedField = ({
  customer,
}: {
  customer: ICustomerDetail;
}) => {
  const { customerEdit } = useCustomerEdit();

  return (
    <div className="flex h-7 items-center px-2">
      <Switch
        size="sm"
        checked={customer.isSubscribed === 'Yes'}
        onCheckedChange={(checked) =>
          customerEdit({
            variables: {
              _id: customer._id,
              isSubscribed: checked ? 'Yes' : 'No',
            },
          })
        }
      />
    </div>
  );
};

// The customer's fields as record table cells: click a value to edit it.
export const CustomerPanelDetail = ({
  customerId,
  children,
}: {
  customerId: string;
  /** Sections drawn under the customer's own fields, such as custom fields. */
  children?: ReactNode;
}) => {
  const expanded = usePanelExpanded();
  const { t } = useTranslation('contact', { keyPrefix: 'customer' });
  const { t: sectionT } = useTranslation('common', { keyPrefix: 'side-panel' });
  const { t: addT } = useTranslation('contact', { keyPrefix: 'customer.add' });
  const { customerDetail, loading } = useCustomerDetail({
    variables: { _id: customerId },
    skip: !customerId,
  });
  const { customerEdit } = useCustomerEdit();

  if (loading && !customerDetail) {
    return <Spinner containerClassName="py-12" />;
  }

  if (!customerDetail) {
    return null;
  }

  const customer = customerDetail;

  // Radix sizes its content as a table, which lets wide values push past the
  // panel; a block lets each value shrink and truncate instead.
  return (
    <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
      <div>
        <div className="border-b px-3 pb-2">
          <ContactDetailSection title={sectionT('general', 'General')} nested>
            <PanelField
              icon={IconUser}
              label={t('owner', 'Owner')}
              placeholder={!customer.ownerId ? t('owner', 'Owner') : undefined}
            >
              <SelectMember.InlineCell
                value={customer.ownerId || ''}
                scope={`${SCOPE}.owner`}
                placeholder={customer.ownerId ? t('owner', 'Owner') : ''}
                showInactive
                className="rounded-sm"
                onValueChange={(ownerId) =>
                  customerEdit({
                    variables: {
                      _id: customer._id,
                      ownerId: typeof ownerId === 'string' ? ownerId : '',
                    },
                  })
                }
              />
            </PanelField>
            <PanelField icon={IconHash} label={addT('code', 'Code')}>
              <CustomerTextField
                customer={customer}
                code="code"
                placeholder={addT('code', 'Code')}
              />
            </PanelField>
            <PanelField icon={IconBriefcase} label={t('position')}>
              <CustomerTextField
                customer={customer}
                code="position"
                placeholder={t('position')}
              />
            </PanelField>
            <PanelField icon={IconSitemap} label={t('department')}>
              <CustomerTextField
                customer={customer}
                code="department"
                placeholder={t('department')}
              />
            </PanelField>
            <PanelField icon={IconCircle} label={addT('state', 'State')}>
              <CustomerStateField customer={customer} />
            </PanelField>
          </ContactDetailSection>
          <ContactDetailSection title={sectionT('contact', 'Contact')} nested>
            <PanelField
              icon={IconMail}
              label={t('emails', 'Emails')}
              placeholder={
                !customer.primaryEmail && !customer.emails?.some(Boolean)
                  ? t('emails', 'Emails')
                  : undefined
              }
            >
              <CustomerEmails
                maxVisible={1}
                _id={customer._id}
                primaryEmail={customer.primaryEmail || ''}
                emails={customer.emails || []}
                emailValidationStatus={customer.emailValidationStatus}
                scope={`${SCOPE}.emails`}
                Trigger={PanelFieldTrigger}
              />
            </PanelField>
            <PanelField
              icon={IconPhone}
              label={t('phones', 'Phones')}
              placeholder={
                !customer.primaryPhone && !customer.phones?.some(Boolean)
                  ? t('phones', 'Phones')
                  : undefined
              }
            >
              <CustomerPhones
                maxVisible={1}
                _id={customer._id}
                primaryPhone={customer.primaryPhone || ''}
                phones={customer.phones || []}
                phoneValidationStatus={toCellPhoneStatus(
                  customer.phoneValidationStatus,
                )}
                scope={`${SCOPE}.phones`}
                Trigger={PanelFieldTrigger}
              />
            </PanelField>
            <PanelField
              icon={IconBell}
              label={addT('subscribed', 'Subscribed')}
            >
              <CustomerSubscribedField customer={customer} />
            </PanelField>
          </ContactDetailSection>
          <CustomerLinksSection key={customer._id} customer={customer} />
          <ContactDetailSection title={sectionT('personal', 'Personal')} nested>
            <PanelField
              icon={IconGenderBigender}
              label={t('sex', 'Sex')}
              placeholder={
                !customer.sex || !SexCodes[customer.sex as SexCode]
                  ? t('sex', 'Sex')
                  : undefined
              }
            >
              <CustomerSexField customer={customer} />
            </PanelField>
            <PanelField
              icon={IconCalendar}
              label={addT('birth-date', 'Birth date')}
            >
              <CustomerBirthDateField customer={customer} />
            </PanelField>
          </ContactDetailSection>
          {!expanded && (
            <ContactDescriptionField
              contentType="core:customer"
              contentId={customer._id}
              value={customer.description || ''}
            />
          )}
        </div>
        <ContactPanelTags
          contentType="core:customer"
          contentId={customer._id}
          tagIds={customer.tagIds}
        />
        <ContactPanelRelationField
          contentType="core:customer"
          contentId={customer._id}
        />
      </div>
      {children}
    </ScrollArea>
  );
};
