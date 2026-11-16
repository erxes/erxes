import {
  IconExternalLink,
  IconMessage,
  IconNote,
  IconPrinter,
} from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PrintDocument,
  SendEmailButton,
  usePanelExpanded,
  usePermissionCheck,
} from 'ui-modules';
import { ContactPanelRecordActions } from '@/side-panel/components/details/ContactPanelRecordActions';

// Panel widths, in px, that the actions need beside the record's title in the
// header row: below these they collapse into a menu and an icon.
const ACTIONS_WIDTH = 900;
const SEND_EMAIL_LABEL_WIDTH = 480;

/** Reads a stored website as a link, ignoring values that are not http(s). */
export const getWebsiteUrl = (website?: string) => {
  if (!website) return undefined;
  try {
    const candidate = new URL(
      website.includes('://') ? website : `https://${website}`,
    );
    return ['https:', 'http:'].includes(candidate.protocol)
      ? candidate
      : undefined;
  } catch {
    return undefined;
  }
};

/** Opens the contact's website, when it has a valid one. */
export const ContactPanelWebsiteLink = ({ website }: { website?: string }) => {
  const websiteUrl = getWebsiteUrl(website);

  if (!websiteUrl) return null;

  return (
    <Button variant="ghost" size="icon" className="size-7" asChild>
      <a
        href={websiteUrl.href}
        target="_blank"
        rel="noreferrer"
        aria-label={website}
        title={website}
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
  website?: string;
}) => (
  <>
    {avatar && <div className="shrink-0">{avatar}</div>}
    <h2 className="min-w-0 flex-1 truncate text-sm font-semibold">{title}</h2>
    <ContactPanelWebsiteLink website={website} />
  </>
);

/** Opens existing mail, conversation, and note workflows for this contact. */
export const ContactPanelActions = ({
  contentType,
  contentId,
  email,
  onMessage,
  onNote,
}: {
  contentType: 'core:customer' | 'core:company';
  contentId: string;
  email?: string;
  onMessage?: () => void;
  onNote: () => void;
}) => {
  const { t } = useTranslation('contact');
  const { hasActionPermission } = usePermissionCheck();
  const [printOpen, setPrintOpen] = useState(false);
  const containerRef = useRef<HTMLElement>(null);
  const [panelWidth, setPanelWidth] = useState(0);
  const expanded = usePanelExpanded();
  const compact = !expanded && panelWidth < ACTIONS_WIDTH;
  const emailIconOnly = !expanded && panelWidth < SEND_EMAIL_LABEL_WIDTH;
  const canMessage =
    Boolean(onMessage) && hasActionPermission('conversationMessageAdd');
  const canNote = hasActionPermission('internalNotesManage');
  const canPrint = hasActionPermission('documentsRead');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const panel = container.closest('[data-record-side-panel]') ?? container;
    const measure = () => setPanelWidth(panel.getBoundingClientRect().width);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(panel);
    return () => {
      observer.disconnect();
    };
  }, []);

  const actions = [
    {
      key: 'message',
      iconClassName: 'text-blue-500',
      label: t('message', 'Message'),
      icon: IconMessage,
      visible: canMessage,
      onClick: () => onMessage?.(),
    },
    {
      key: 'note',
      iconClassName: 'text-amber-500',
      label: t('add-note', 'Add note'),
      icon: IconNote,
      visible: canNote,
      onClick: onNote,
    },
    {
      key: 'print',
      iconClassName: 'text-blue-500',
      label: t('print', 'Print'),
      icon: IconPrinter,
      visible: canPrint,
      onClick: () => setPrintOpen(true),
    },
  ].filter((action) => action.visible);

  return (
    <section
      ref={containerRef}
      className="flex max-w-full shrink-0 flex-wrap items-center justify-end gap-1"
      aria-label={t('contact-actions', 'Contact actions')}
    >
      {email && (
        <SendEmailButton
          compact={emailIconOnly}
          variant={emailIconOnly ? 'ghost' : 'outline'}
          className={emailIconOnly ? 'size-7' : undefined}
          target={{
            ...(contentType === 'core:customer'
              ? { customerId: contentId }
              : { companyId: contentId }),
            email,
          }}
        />
      )}
      {!compact &&
        actions.map(({ key, label, icon: Icon, onClick }) => (
          <Button
            key={key}
            type="button"
            variant="outline"
            size="sm"
            onClick={onClick}
          >
            <Icon className="size-4" aria-hidden="true" />
            {label}
          </Button>
        ))}
      <ContactPanelRecordActions
        contentType={contentType}
        contentId={contentId}
        includePrint={false}
        preventCloseAutoFocus={printOpen}
        quickActions={
          compact
            ? actions.map(
                ({ key, label, icon: Icon, onClick, iconClassName }) => ({
                  key,
                  label,
                  icon: <Icon className={iconClassName} aria-hidden="true" />,
                  onSelect: onClick,
                }),
              )
            : undefined
        }
      />
      {canPrint && (
        <PrintDocument
          items={[{ _id: contentId }]}
          contentType={
            contentType === 'core:customer'
              ? 'core:contact.customer'
              : 'core:contact.company'
          }
          open={printOpen}
          onOpenChange={setPrintOpen}
          trigger={null}
        />
      )}
    </section>
  );
};
