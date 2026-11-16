import { TemplateFlowPreview } from '@/template/components/TemplateFlowPreview';
import { useTemplateCard } from '@/template/hooks/useTemplateCard';
import { TTemplate } from '@/template/types';
import { IconFilter } from '@tabler/icons-react';
import { Button, Card, IconComponent } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Can } from 'ui-modules';

export const TemplateCard = ({ template }: { template: TTemplate }) => {
  const { t } = useTranslation('templates');
  const { preview, isSegment, summary, installsLabel, installHref } =
    useTemplateCard(template);

  return (
    <Card className="flex flex-col gap-3 rounded-xl p-1.5">
      {preview && <TemplateFlowPreview preview={preview} />}
      {isSegment && (
        <div className="flex h-28 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground">
          {template.icon ? (
            <IconComponent name={template.icon} className="size-8" />
          ) : (
            <IconFilter className="size-8" />
          )}
        </div>
      )}

      <div className="flex flex-1 flex-col gap-1 px-2">
        <h3 className="truncate text-sm font-semibold">{template.name}</h3>
        <p className="truncate text-xs text-muted-foreground">{summary}</p>
        {template.description && (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {template.description}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between border-t px-2 pb-1 pt-2.5">
        <span className="text-xs text-muted-foreground">{installsLabel}</span>
        <Can action="templatesInstall">
          <Button asChild size="sm">
            <Link to={installHref}>{t('install')}</Link>
          </Button>
        </Can>
      </div>
    </Card>
  );
};
