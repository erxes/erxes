import { IconPencil } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useNotificationEmailBrand } from '../hooks/useNotificationEmailBrand';

export const NOTIFICATION_BRAND_PATH = '/settings/notification/brand';

/** The brand's part of the email, shown in place and edited only in Brand. */
export const NotificationTemplateBrandFrame = ({
  part,
}: {
  part: 'header' | 'footer';
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  const { brand } = useNotificationEmailBrand();

  const content =
    part === 'header' ? (
      brand?.logoUrl ? (
        <img
          src={brand.logoUrl}
          alt={brand.name || ''}
          className="w-auto h-8"
        />
      ) : (
        <span className="font-semibold text-base">
          {brand?.name || t('brand-header-empty')}
        </span>
      )
    ) : (
      <span className="text-muted-foreground text-xs whitespace-pre-line">
        {brand?.footerText || t('brand-footer-empty')}
      </span>
    );

  return (
    <div
      className={
        part === 'header'
          ? 'group flex justify-between items-center gap-3 px-6 py-4 border-b border-dashed'
          : 'group flex justify-between items-center gap-3 px-6 py-4 border-t border-dashed'
      }
    >
      {content}
      <Link
        to={NOTIFICATION_BRAND_PATH}
        className="flex items-center gap-1 opacity-0 group-hover:opacity-100 text-muted-foreground text-xs transition-opacity"
      >
        <IconPencil size={12} />
        {t('edit-brand')}
      </Link>
    </div>
  );
};
