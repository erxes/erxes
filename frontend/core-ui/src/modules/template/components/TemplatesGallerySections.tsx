import { TemplateCard } from '@/template/components/TemplateCard';
import { TEMPLATE_GRID_CLASS } from '@/template/constants/templateGallery';
import { useTemplatesGallerySections } from '@/template/hooks/useTemplatesGallerySections';
import { IconArrowRight } from '@tabler/icons-react';
import { Button } from 'erxes-ui';

export const TemplatesGallerySections = () => {
  const sections = useTemplatesGallerySections();

  return (
    <div className="space-y-8 p-5">
      {sections.map(
        ({
          group,
          templates,
          icon: Icon,
          title,
          description,
          seeAllLabel,
          seeAll,
        }) => (
          <section key={group} className="space-y-3">
            <div className="flex items-end justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold">{title}</h3>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
              </div>
              {seeAllLabel && (
                <Button variant="ghost" size="sm" onClick={seeAll}>
                  {seeAllLabel}
                  <IconArrowRight className="size-4" />
                </Button>
              )}
            </div>
            <div className={TEMPLATE_GRID_CLASS}>
              {templates.map((template) => (
                <TemplateCard
                  key={`${template.pluginName}:${template.id}`}
                  template={template}
                />
              ))}
            </div>
          </section>
        ),
      )}
    </div>
  );
};
