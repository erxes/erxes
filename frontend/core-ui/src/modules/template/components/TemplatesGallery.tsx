import { TemplateCard } from '@/template/components/TemplateCard';
import {
  TemplateEmpty,
  TemplateError,
  TemplateLoading,
} from '@/template/components/TemplateStateViews';
import { useTemplates } from '@/template/hooks/useTemplates';
import { useTranslation } from 'react-i18next';

export const TemplatesGallery = () => {
  const { t } = useTranslation('templates');
  const { templates, loading, error } = useTemplates();

  if (loading) {
    return <TemplateLoading />;
  }

  if (error) {
    return <TemplateError message={error.message} />;
  }

  if (!templates.length) {
    return (
      <TemplateEmpty
        title={t('no-templates')}
        description={t('no-templates-body')}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {templates.map((template) => (
        <TemplateCard
          key={`${template.pluginName}:${template.id}`}
          template={template}
        />
      ))}
    </div>
  );
};
