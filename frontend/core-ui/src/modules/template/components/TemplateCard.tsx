import { TemplateFlowPreview } from '@/template/components/TemplateFlowPreview';
import { useTemplatePreview } from '@/template/hooks/useTemplatePreview';
import { TTemplate } from '@/template/types';
import { Button, Card } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Can } from 'ui-modules';

export const TemplateCard = ({ template }: { template: TTemplate }) => {
  const { t } = useTranslation('templates');
  const preview = useTemplatePreview(template);
  const agentCount = template.parts.filter(
    ({ type }) => type === 'automations:aiAgent',
  ).length;

  return (
    <Card className="flex flex-col gap-3 rounded-xl p-1.5">
      {preview && <TemplateFlowPreview preview={preview} />}

      <div className="flex flex-1 flex-col gap-1 px-2">
        <h3 className="truncate text-sm font-semibold">{template.name}</h3>
        <p className="truncate text-xs text-muted-foreground">
          {[
            preview?.trigger.label,
            t('steps-to-answer', {
              count: template.requirements.length,
            }),
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
        {template.description && (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {template.description}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between border-t px-2 pb-1 pt-2.5">
        <span className="text-xs text-muted-foreground">
          {t('automation-count', { count: template.journeys.length })}
          {agentCount > 0 && ` · ${t('agent-count', { count: agentCount })}`}
        </span>
        <Can action="templatesInstall">
          <Button asChild size="sm">
            <Link to={`/templates/${template.pluginName}/${template.id}`}>
              {t('install')}
            </Link>
          </Button>
        </Can>
      </div>
    </Card>
  );
};
