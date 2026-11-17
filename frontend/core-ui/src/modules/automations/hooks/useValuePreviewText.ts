import { TValuePreview } from '@/automations/utils/automationVersions';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

/** A config value preview in words: "Email · 3 blocks", "Yes", "—". */
export const useValuePreviewText = () => {
  const { t } = useTranslation('automations');

  return useCallback(
    (preview: TValuePreview) => {
      switch (preview.kind) {
        case 'empty':
          return '—';
        case 'boolean':
          return preview.value
            ? t('versions-value-yes')
            : t('versions-value-no');
        case 'html':
          return t('versions-value-html', { size: preview.kilobytes });
        case 'document':
          return t('versions-value-document', { count: preview.blocks });
        case 'list':
          return t('versions-value-list', { count: preview.count });
        default:
          return preview.text;
      }
    },
    [t],
  );
};
