import { Badge, Tabs } from 'erxes-ui';
import { Inspector } from '@react-email/editor/ui';
import { IconAlertTriangle, IconCheck } from '@tabler/icons-react';
import type { ReadinessCheck } from './utils';

interface EditorStats {
  words: number;
  links: number;
  images: number;
  headings: number;
}

interface EditorSidebarProps {
  readinessScore: number;
  readinessChecks: ReadinessCheck[];
  stats: EditorStats;
}

const MetricCard = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-md border bg-background p-3">
    <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
      {label}
    </p>
    <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
  </div>
);

export const EditorSidebar = ({
  readinessScore,
  readinessChecks,
  stats,
}: EditorSidebarProps) => (
  <aside className="hidden border-l bg-muted/10 xl:flex xl:min-h-0 xl:flex-col [color-scheme:initial]">
    <Tabs
      defaultValue="inspect"
      className="flex h-full min-h-0 flex-1 flex-col"
    >
      <Tabs.List className="shrink-0 px-4 pt-3">
        <Tabs.Trigger value="inspect">Inspect</Tabs.Trigger>
        <Tabs.Trigger value="readiness">Readiness</Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content
        value="inspect"
        className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-2"
      >
        <Inspector.Root className="text-foreground">
          <Inspector.Breadcrumb />
          <Inspector.Document />
          <Inspector.Node />
          <Inspector.Text />
        </Inspector.Root>
      </Tabs.Content>

      <Tabs.Content
        value="readiness"
        className="min-h-0 flex-1 overflow-y-auto px-4 pb-4"
      >
        <div className="space-y-3 py-3">
          <div className="rounded-md border bg-background p-4">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
              Readiness score
            </p>
            <div className="mt-2 flex items-end justify-between gap-2">
              <span className="text-3xl font-semibold tabular-nums">
                {readinessScore}%
              </span>
              <Badge variant={readinessScore >= 80 ? 'success' : 'warning'}>
                {readinessScore >= 80 ? 'Strong' : 'Needs work'}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <MetricCard label="Words" value={stats.words} />
            <MetricCard label="Links" value={stats.links} />
            <MetricCard label="Images" value={stats.images} />
            <MetricCard label="Headings" value={stats.headings} />
          </div>

          <div className="space-y-2">
            {readinessChecks.map((check) => (
              <div
                key={check.label}
                className="rounded-md border bg-background p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-snug">
                      {check.label}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {check.description}
                    </p>
                  </div>
                  <Badge
                    variant={check.tone === 'success' ? 'success' : 'warning'}
                    className="mt-0.5 shrink-0"
                  >
                    {check.tone === 'success' ? (
                      <IconCheck className="size-3" />
                    ) : (
                      <IconAlertTriangle className="size-3" />
                    )}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Tabs.Content>
    </Tabs>
  </aside>
);
