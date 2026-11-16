import { TemplateCard } from '@/template/components/TemplateCard';
import { TemplatesGalleryFilters } from '@/template/components/TemplatesGalleryFilters';
import { TemplatesGalleryHero } from '@/template/components/TemplatesGalleryHero';
import { TemplatesGallerySections } from '@/template/components/TemplatesGallerySections';
import { TEMPLATE_GRID_CLASS } from '@/template/constants/templateGallery';
import { cn } from 'erxes-ui';
import {
  TemplateEmpty,
  TemplateError,
  TemplateLoading,
} from '@/template/components/TemplateStateViews';
import { useTemplatesGallery } from '@/template/hooks/useTemplatesGallery';
import { useTranslation } from 'react-i18next';

export const TemplatesGallery = () => {
  const { t } = useTranslation('templates');
  const { templates, hasTemplates, loading, error, isBrowsing } =
    useTemplatesGallery();

  if (loading) {
    return <TemplateLoading />;
  }

  if (error) {
    return <TemplateError message={error.message} />;
  }

  if (!hasTemplates) {
    return (
      <TemplateEmpty
        title={t('no-templates')}
        description={t('no-templates-body')}
      />
    );
  }

  return (
    <>
      <TemplatesGalleryHero />
      <TemplatesGalleryFilters />
      {isBrowsing && <TemplatesGallerySections />}
      {!isBrowsing && !!templates.length && (
        <div className={cn(TEMPLATE_GRID_CLASS, 'p-5')}>
          {templates.map((template) => (
            <TemplateCard
              key={`${template.pluginName}:${template.id}`}
              template={template}
            />
          ))}
        </div>
      )}
      {!isBrowsing && !templates.length && (
        <TemplateEmpty
          title={t('no-templates-filtered')}
          description={t('no-templates-filtered-body')}
        />
      )}
    </>
  );
};
