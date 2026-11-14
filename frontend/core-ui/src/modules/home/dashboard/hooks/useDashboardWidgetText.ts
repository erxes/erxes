import { TDashboardWidgetDefinition } from '@/home/dashboard/types/dashboardTypes';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

/** A widget's name and description in its own namespace. */
export const useDashboardWidgetText = () => {
  const { t } = useTranslation();

  return useCallback(
    ({ ns, labelKey, descriptionKey }: TDashboardWidgetDefinition) => ({
      label: t(labelKey, { ns, defaultValue: labelKey }),
      description: descriptionKey
        ? t(descriptionKey, { ns, defaultValue: descriptionKey })
        : '',
    }),
    [t],
  );
};
