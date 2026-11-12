import { IconArrowBackUp, IconDots, IconExternalLink, IconTrash } from '@tabler/icons-react';
import { Button, Command, Popover, useConfirm } from 'erxes-ui';
import { type ReactNode, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useCan, useSession } from '~/modules/auth/session';
import { useCompaniesRemove, useCompanyEdit } from '~/modules/contacts/companies/useCompanies';
import { useCustomerEdit, useCustomersRemove } from '~/modules/contacts/customers/useCustomers';
import {
  getContactDetailPath,
  getContactListPath,
} from '~/modules/contacts/utils/contactDetailPath';
import { getSidePanelRecordPath } from '../sidePanelPaths';
import { useSidePanel } from '../useSidePanel';
import { useLeadsT } from '~/modules/leads/i18n';

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
    <Button variant="ghost" size="icon" className="size-7" asChild>
      <a
        href={websiteUrl.href}
        target="_blank"
        rel="noreferrer"
        aria-label={website ?? undefined}
        title={website ?? undefined}
      >
        <IconExternalLink className="size-4" aria-hidden="true" />
      </a>
    </Button>
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
 * The record's "more" menu (old ContactPanelRecordActions). Core has no
 * print, broadcast or export yet, so it holds Delete (owners and admins).
 */
export const ContactPanelActions = ({
  contentType,
  contentId,
  state,
}: {
  contentType: 'core:customer' | 'core:company';
  contentId: string;
  /** A customer can be made a lead again from here. */
  state?: 'lead' | 'customer';
}) => {
  const { t } = useTranslation('contact');
  const { user } = useSession();
  const panel = useSidePanel();
  const currentPanel = useRef(panel);

  useLayoutEffect(() => {
    currentPanel.current = panel;
  }, [panel]);

  const { confirm } = useConfirm();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const removeCustomers = useCustomersRemove();
  const removeCompanies = useCompaniesRemove();
  const remove = contentType === 'core:customer' ? removeCustomers : removeCompanies;
  const can = useCan();
  const leadsT = useLeadsT();
  const canDelete = can('contacts.delete');
  const canReopen = state === 'customer' && can('contacts.edit');
  const editCustomer = useCustomerEdit();
  const editCompany = useCompanyEdit();

  if (!canDelete && !canReopen) return null;

  const deleteContact = async () => {
    try {
      await confirm({
        message: t('confirm-delete-contact', 'Delete this contact?'),
        options: { okLabel: t('action-delete', 'Delete'), variants: { ok: 'destructive' } },
      });
    } catch {
      return;
    }

    remove.mutate(
      { ids: [contentId] },
      {
        onSuccess: () => {
          currentPanel.current.dismissPath(getSidePanelRecordPath({ contentType, contentId }));

          const { pathname, search } = window.location;

          if (pathname === getContactDetailPath(contentType, contentId, pathname)) {
            navigate({ pathname: getContactListPath(contentType, pathname), search });
          }
        },
      },
    );
  };

  return (
    <section
      className="flex max-w-full shrink-0 flex-wrap items-center justify-end gap-1"
      aria-label={t('contact-actions', 'Contact actions')}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label={t('actions', 'Actions')}
            title={t('actions', 'Actions')}
          >
            <IconDots className="size-4" />
          </Button>
        </Popover.Trigger>
        <Popover.Content className="min-w-[280px] p-0" align="end" side="bottom" sideOffset={8}>
          <Command>
            <Command.List className="p-0">
              <Command.Group className="p-1">
                {canReopen && (
                  <Command.Item
                    onSelect={() => {
                      setOpen(false);
                      (contentType === 'core:customer' ? editCustomer : editCompany).mutate({
                        id: contentId,
                        state: 'lead',
                      });
                    }}
                  >
                    <IconArrowBackUp />
                    {leadsT('actions.make-lead')}
                  </Command.Item>
                )}
                {canDelete && (
                  <Command.Item
                    className="text-destructive"
                    disabled={remove.isPending}
                    onSelect={() => {
                      setOpen(false);
                      void deleteContact();
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
