import {
  IconExternalLink,
  IconMail,
  IconMessage,
  IconNote,
  IconDots,
  IconPrinter,
} from '@tabler/icons-react';
import { Button, DropdownMenu } from 'erxes-ui';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { PrintDocument, useComposeEmail, usePermissionCheck } from 'ui-modules';

/** Opens existing mail, conversation, and note workflows for this contact. */
export const ContactPanelActions = ({
  contentType,
  contentId,
  email,
  website,
  title,
  avatar,
  onMessage,
  onNote,
}: {
  contentType: 'core:customer' | 'core:company';
  contentId: string;
  email?: string;
  website?: string;
  title: ReactNode;
  avatar?: ReactNode;
  onMessage?: () => void;
  onNote: () => void;
}) => {
  const { t } = useTranslation('contact');
  const { canComposeEmail, composeEmail } = useComposeEmail();
  const { hasActionPermission } = usePermissionCheck();
  const [printOpen, setPrintOpen] = useState(false);
  const containerRef = useRef<HTMLElement>(null);
  const [compact, setCompact] = useState(true);
  const canMessage =
    !!onMessage && hasActionPermission('conversationMessageAdd');
  const canNote = hasActionPermission('internalNotesManage');
  const canPrint = hasActionPermission('documentsRead');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () =>
      setCompact(container.getBoundingClientRect().width < 640);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const actions = [
    {
      key: 'message',
      iconClassName: 'text-blue-500',
      label: t('message', 'Message'),
      icon: IconMessage,
      visible: canMessage,
      onClick: () => onMessage?.(),
      className:
        'bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 dark:text-blue-400',
    },
    {
      key: 'email',
      iconClassName: 'text-emerald-500',
      label: t('email', 'Email'),
      icon: IconMail,
      visible: canComposeEmail,
      onClick: () =>
        composeEmail({
          ...(contentType === 'core:customer'
            ? { customerId: contentId }
            : { companyId: contentId }),
          ...(email ? { email } : {}),
        }),
      className:
        'bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400',
    },
    {
      key: 'note',
      iconClassName: 'text-amber-500',
      label: t('add-note', 'Add note'),
      icon: IconNote,
      visible: canNote,
      onClick: onNote,
      className:
        'bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 dark:text-amber-400',
    },
    {
      key: 'print',
      iconClassName: 'text-blue-500',
      label: t('print', 'Print'),
      icon: IconPrinter,
      visible: canPrint,
      onClick: () => setPrintOpen(true),
      className:
        'bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 dark:text-blue-400',
    },
  ].filter((action) => action.visible);

  let websiteUrl: URL | undefined;
  if (website) {
    try {
      const candidate = new URL(
        website.includes('://') ? website : `https://${website}`,
      );
      if (['https:', 'http:'].includes(candidate.protocol))
        websiteUrl = candidate;
    } catch {
      websiteUrl = undefined;
    }
  }

  return (
    <section
      ref={containerRef}
      className="shrink-0 border-b px-4 py-4"
      aria-label={t('contact-actions', 'Contact actions')}
    >
      <div className="flex min-w-0 items-center gap-3">
        {avatar && <div className="shrink-0 [&>*]:size-11">{avatar}</div>}
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-semibold leading-6">{title}</h2>
          {websiteUrl && (
            <a
              href={websiteUrl.href}
              target="_blank"
              rel="noreferrer"
              className="mt-1 flex w-fit max-w-full items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <IconExternalLink
                className="size-3.5 shrink-0"
                aria-hidden="true"
              />
              <span className="truncate">{website}</span>
            </a>
          )}
        </div>
        {actions.length > 0 && (
          <div className="ml-auto flex shrink-0 items-center gap-2">
            {compact ? (
              <DropdownMenu>
                <DropdownMenu.Trigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={t('actions', 'Actions')}
                  >
                    <IconDots className="size-4" aria-hidden="true" />
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content
                  align="end"
                  onCloseAutoFocus={(event) => {
                    if (printOpen) event.preventDefault();
                  }}
                >
                  {actions.map(
                    ({ key, label, icon: Icon, onClick, iconClassName }) => (
                      <DropdownMenu.Item key={key} onSelect={onClick}>
                        <Icon className={iconClassName} aria-hidden="true" />
                        {label}
                      </DropdownMenu.Item>
                    ),
                  )}
                </DropdownMenu.Content>
              </DropdownMenu>
            ) : (
              actions.map(({ key, label, icon: Icon, onClick, className }) => (
                <Button
                  key={key}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClick}
                  className={className}
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {label}
                </Button>
              ))
            )}
          </div>
        )}
      </div>
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
