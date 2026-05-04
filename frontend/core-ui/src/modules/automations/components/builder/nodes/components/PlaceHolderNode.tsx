import { automationBuilderSiderbarOpenState } from '@/automations/states/automationState';
import { IconBolt, IconPlus } from '@tabler/icons-react';
import { Node, NodeProps } from '@xyflow/react';
import { Button, Card, cn } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

export const PlaceHolderNode = memo(({ selected }: NodeProps<Node<any>>) => {
  const setSidebarOpen = useSetAtom(automationBuilderSiderbarOpenState);
  const openSidebar = () => setSidebarOpen(true);
  const { t } = useTranslation('automations');

  return (
    <div className="flex flex-col">
      <div className="ml-1 w-fit rounded-t-md bg-primary/10 px-3 py-1 text-primary">
        <p className="text-sm font-semibold">{t('start')}</p>
      </div>
      <Card
        className={cn(
          'relative w-[280px] border border-primary/15 bg-background shadow-md transition-all duration-200',
          {
            'ring-2 ring-primary': selected,
          },
        )}
      >
        <Card.Header className="p-4 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
              <IconBolt className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary/70">
                {t('trigger')}
              </p>
              <Card.Title className="text-lg leading-5">
                {t('choose-a-trigger')}
              </Card.Title>
            </div>
          </div>
          <Card.Description className="pt-3 text-sm leading-5 text-muted-foreground">
            {t('choose-trigger-description')}
          </Card.Description>
        </Card.Header>
        <Card.Content className="p-4 pt-0">
          <Button
            variant="outline"
            className="h-10 w-full justify-center rounded-md border-dashed border-primary/30 bg-primary/5 text-primary hover:bg-primary/10"
            onClick={openSidebar}
          >
            <IconPlus className="size-4" />
            {t('add-trigger')}
          </Button>
        </Card.Content>

        <div className="pointer-events-none absolute -right-3 top-1/2 flex -translate-y-1/2 items-center">
          <div className="h-px w-7 bg-gradient-to-r from-primary/70 to-transparent" />
          <div className="size-5 rounded-full border-4 border-background bg-primary shadow-sm" />
        </div>
      </Card>
    </div>
  );
});
