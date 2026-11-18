import { TTemplate } from '@/template/types';
import { useMemo } from 'react';

/** The first journey's flow, the employee drawn as the template's own icon. */
export const useTemplatePreview = (template?: TTemplate) =>
  useMemo(() => {
    const preview = template?.journeys[0]?.preview;

    if (!preview) {
      return undefined;
    }

    return {
      ...preview,
      hub: preview.hub && {
        ...preview.hub,
        icon: template?.icon || preview.hub.icon,
      },
    };
  }, [template]);
