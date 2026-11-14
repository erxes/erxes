import { IconArrowBackUp, IconDots, IconExternalLink, IconTrash } from '@tabler/icons-react';
import { Button, Command, Popover, useConfirm, cn, buttonVariants } from 'erxes-ui';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useCan } from '~/modules/auth/session';
import { useCompaniesRemove, useCompanyEdit } from '~/modules/contacts/companies/useCompanies';
import { useCustomerEdit, useCustomersRemove } from '~/modules/contacts/customers/useCustomers';
import {
  getContactDetailPath,
  getContactListPath,
} from '~/modules/contacts/utils/contactDetailPath';
import { useLeadsT } from '~/modules/leads/i18n';
import { getSidePanelRecordPath } from '../sidePanelPaths';
import { useSidePanel } from '../useSidePanel';

type ContactType = 'core:customer' | 'core:company';

/** Reads a stored website as a link, ignoring values that are not http(s). */
const getWebsiteUrl = (website?: string | null) => {
  if (!website) return undefined;

  try {
    const candidate = new URL(website.includes('://') ? website : `https://${website}`);

    return ['https:', 'http:'].includes(candidate.protocol) ? candidate : undefined;
  } catch {
    return undefined;
  }
};

/** Opens the contact's website, when it has a valid one. */
export const ContactPanelWebsiteLink = ({ website }: { website?: string | null }) => {
  const websiteUrl = getWebsiteUrl(website);

  if (!websiteUrl) return null;

  return (
    <a
      href={websiteUrl.href}
      target="_blank"
      rel="noreferrer"
      aria-label={website ?? undefined}
      title={website ?? undefined}
      className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'size-7')}
    >
      <IconExternalLink className="size-4" aria-hidden="true" />
    </a>
  );
};

/** Names the contact in the row above the fields of an expanded record. */
export const ContactPanelIdentity = ({
  title,
  avatar,
  website,
}: {
  title: ReactNode;
  avatar?: ReactNode;
  website?: string | null;
}) => (
  <>
    {avatar && <div className="shrink-0">{avatar}</div>}
    <h2 className="min-w-0 flex-1 truncate text-sm font-semibold">{title}</h2>
    <ContactPanelWebsiteLink website={website} />
  </>
);

/**
 * Deletes the contact once confirmed, takes it out of the panel and leaves its
 * own page for the list.
 */
const useDeleteContact = (contentType: ContactType, contentId: string) => {
  const { t } = useTranslation('contact');
  const { dismissPath } = useSidePanel();
  const { confirm } = useConfirm();
  const navigate = useNavigate();
  const removeCustomers = useCustomersRemove();
  const removeCompanies = useCompaniesRemove();
  const remove = contentType === 'core:customer' ? removeCustomers : removeCompanies;

  const onDeleted = () => {
    dismissPath(getSidePanelRecordPath({ contentType, contentId }));

    const { pathname, search } = window.location;

    if (pathname === getContactDetailPath(contentType, contentId, pathname)) {
      void navigate({ pathname: getContactListPath(contentType, pathname), search });
    }
  };

  const deleteContact = () =>
    void confirm({
      message: t('confirm-delete-contact', 'Delete this contact?'),
      options: { okLabel: t('action-delete', 'Delete'), variants: { ok: 'destructive' } },
    }).then(() => remove.mutate({ ids: [contentId] }, { onSuccess: onDeleted }));

  return { deleteContact, deleting: remove.isPending };
};

/** Makes the customer or company a lead again. */
const useMakeLead = (contentType: ContactType, contentId: string) => {
  const editCustomer = useCustomerEdit();
  const editCompany = useCompanyEdit();

  return () =>
    (contentType === 'core:customer' ? editCustomer : editCompany).mutate({
      id: contentId,
      state: 'lead',
    });
};

/**
 * The record's "more" menu: make a customer a lead again (editors), and
 * Delete (owners and admins).
 */
export const ContactPanelActions = ({
  contentType,
  contentId,
  state,
}: {
  contentType: ContactType;
  contentId: string;
  /** A customer can be made a lead again from here. */
  state?: 'lead' | 'customer';
}) => {
  const { t } = useTranslation('contact');
  const leadsT = useLeadsT();
  const [open, setOpen] = useState(false);
  const can = useCan();
  const canDelete = can('contacts.delete');
  const canReopen = state === 'customer' && can('contacts.edit');
  const makeLead = useMakeLead(contentType, contentId);
  const { deleteContact, deleting } = useDeleteContact(contentType, contentId);

  if (!canDelete && !canReopen) return null;

  return (
    <section
      className="flex max-w-full shrink-0 flex-wrap items-center justify-end gap-1"
      aria-label={t('contact-actions', 'Contact actions')}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              aria-label={t('actions', 'Actions')}
              title={t('actions', 'Actions')}
            />
          }
        >
          <IconDots className="size-4" />
        </Popover.Trigger>
        <Popover.Content
          variant="flush"
          className="min-w-70"
          align="end"
          side="bottom"
          sideOffset={8}
        >
          <Command>
            <Command.List>
              <Command.Group>
                {canReopen && (
                  <Command.Item
                    onSelect={() => {
                      setOpen(false);
                      makeLead();
                    }}
                  >
                    <IconArrowBackUp />
                    {leadsT('actions.make-lead')}
                  </Command.Item>
                )}
                {canDelete && (
                  <Command.Item
                    variant="destructive"
                    disabled={deleting}
                    onSelect={() => {
                      setOpen(false);
                      deleteContact();
                    }}
                  >
                    <IconTrash />
                    {t('action-delete', 'Delete')}
                  </Command.Item>
                )}
              </Command.Group>
            </Command.List>
          </Command>
        </Popover.Content>
      </Popover>
    </section>
  );
};
