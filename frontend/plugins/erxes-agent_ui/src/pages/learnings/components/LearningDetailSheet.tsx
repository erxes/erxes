import { IconBulb, IconTag } from '@tabler/icons-react';
import { Badge, Separator, Sheet } from 'erxes-ui';
import { ILearningRow, confidencePct, statusVariant } from '../types';

export const LearningDetailSheet = ({
  item,
  onClose,
}: {
  item: ILearningRow | null;
  onClose: () => void;
}) => (
  <Sheet open={!!item} onOpenChange={(open) => !open && onClose()}>
    <Sheet.View className="w-[40rem] max-w-[92vw] flex flex-col p-0 sm:max-w-[92vw]">
      <Sheet.Header className="gap-2">
        <IconBulb className="size-5 text-primary" />
        <Sheet.Title>Learning</Sheet.Title>
        <Sheet.Close />
      </Sheet.Header>
      <Sheet.Content className="flex-1 min-h-0 overflow-auto p-6 space-y-6">
        <section className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <IconBulb className="size-4" />
            Statement
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {item?.statement}
          </p>
        </section>
        <Separator />
        <section className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Type
            </div>
            <Badge variant="secondary">{item?.type}</Badge>
          </div>
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Status
            </div>
            {item ? (
              <Badge variant={statusVariant(item.status)}>{item.status}</Badge>
            ) : null}
          </div>
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Confidence
            </div>
            <span>{confidencePct(item?.confidence)}</span>
          </div>
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Distinct sources
            </div>
            <span>{item?.sourceCount ?? 0}</span>
          </div>
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Pinned
            </div>
            <span>{item?.pinned ? 'Yes' : 'No'}</span>
          </div>
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Agent
            </div>
            <span>{item?.agentId || 'All agents'}</span>
          </div>
        </section>
        {item?.contextTags?.length ? (
          <>
            <Separator />
            <section className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <IconTag className="size-4" />
                Context tags
              </div>
              <div className="flex flex-wrap gap-1">
                {item.contextTags.map((t) => (
                  <Badge key={t} variant="secondary">
                    {t}
                  </Badge>
                ))}
              </div>
            </section>
          </>
        ) : null}
      </Sheet.Content>
    </Sheet.View>
  </Sheet>
);
