import { TEMPLATES } from '@/template/graphql/queries';
import { TTemplate } from '@/template/types';
import { useQuery } from '@apollo/client';
import { useCallback, useMemo, useState } from 'react';
import { usePermissionCheck } from 'ui-modules';

// Enough to choose from at a glance; the gallery has the rest
const SHOWN_TEMPLATES = 6;
const FALLBACK_ICON = 'IconAffiliate';

export const AUTOMATION_GALLERY_PATH = '/templates?group=automation';
export const AUTOMATION_SCRATCH_PATH = '/automations/create';

export type TAutomationTemplateOption = {
  key: string;
  href: string;
  icon: string;
  name: string;
  description?: string;
};

const isAutomationTemplate = ({ group }: TTemplate) => group === 'automation';

const toTemplateOption = (template: TTemplate): TAutomationTemplateOption => ({
  key: `${template.pluginName}:${template.id}`,
  href: `/templates/${template.pluginName}/${template.id}`,
  icon: template.icon || FALLBACK_ICON,
  name: template.name,
  description: template.description,
});

/**
 * The create dialog: whether it is open and the automation templates it
 * offers beside starting blank. Templates are read only once it opens, and
 * only for someone allowed to install them.
 */
export const useAutomationCreateDialog = () => {
  const [open, setOpen] = useState(false);
  const { isLoaded, hasActionPermission } = usePermissionCheck();
  const canInstall = isLoaded && hasActionPermission('templatesInstall');
  const { data, loading, error } = useQuery<{ templates: TTemplate[] }>(
    TEMPLATES,
    { skip: !open || !canInstall },
  );

  const automationTemplates = useMemo(
    () => (data?.templates || []).filter(isAutomationTemplate),
    [data],
  );
  const templateOptions = useMemo(
    () => automationTemplates.slice(0, SHOWN_TEMPLATES).map(toTemplateOption),
    [automationTemplates],
  );
  const hasMore = automationTemplates.length > SHOWN_TEMPLATES;

  const openDialog = useCallback(() => setOpen(true), []);

  return {
    open,
    setOpen,
    openDialog,
    canInstall,
    templateOptions,
    galleryLabelKey: hasMore
      ? 'create-dialog-see-all'
      : 'create-dialog-open-gallery',
    loading,
    error,
  };
};

export type TAutomationCreateDialogState = ReturnType<
  typeof useAutomationCreateDialog
>;
