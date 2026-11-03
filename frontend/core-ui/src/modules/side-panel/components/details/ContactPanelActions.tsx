import {
  IconExternalLink,
  IconMail,
  IconMessage,
  IconNote,
} from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useComposeEmail, usePermissionCheck } from 'ui-modules';

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
      className="shrink-0 border-b px-4 py-4"
      aria-label={t('contact-actions', 'Contact actions')}
    >
      <div className="flex min-w-0 items-center gap-3">
        {avatar && <div className="shrink-0 [&>*]:size-11">{avatar}</div>}
        <div className="min-w-0">
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
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {onMessage && hasActionPermission('conversationMessageAdd') && (
          <Button type="button" variant="outline" size="sm" onClick={onMessage}>
            <IconMessage className="size-4" aria-hidden="true" />
            {t('message', 'Message')}
          </Button>
        )}
        {canComposeEmail && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              composeEmail({
                ...(contentType === 'core:customer'
                  ? { customerId: contentId }
                  : { companyId: contentId }),
                ...(email ? { email } : {}),
              })
            }
          >
            <IconMail className="size-4" aria-hidden="true" />
            {t('email', 'Email')}
          </Button>
        )}
        {hasActionPermission('internalNotesManage') && (
          <Button type="button" variant="outline" size="sm" onClick={onNote}>
            <IconNote className="size-4" aria-hidden="true" />
            {t('add-note', 'Add note')}
          </Button>
        )}
      </div>
    </section>
  );
};
