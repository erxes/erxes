import { AiAgentBot } from '@/automations/components/settings/components/agents/components/bot/AiAgentBot';
import { TAiAgentStepStatus } from '@/automations/components/settings/components/agents/constants/aiAgentSteps';
import { useAiAgentDetailContext } from '@/automations/components/settings/components/agents/context/AiAgentDetailContext';
import { useAiAgentProfile } from '@/automations/components/settings/components/agents/hooks/useAiAgentProfile';
import { AUTOMATION_APPROVAL_CONTENT_TYPES } from '@/automations/constants';
import { useSessionTab } from '@/automations/hooks/useSessionTab';
import {
  IconAlertTriangle,
  IconDeviceFloppy,
  IconX,
} from '@tabler/icons-react';
import { Badge, BadgeProps, Button, cn, Sheet } from 'erxes-ui';
import { ApprovalLockButton } from 'ui-modules';

const HEADLINE_VARIANTS: Record<TAiAgentStepStatus, BadgeProps['variant']> = {
  error: 'destructive',
  warning: 'warning',
  missing: 'secondary',
  pending: 'secondary',
  hint: 'success',
  done: 'success',
};

export const AiAgentProfileBar = () => {
  const { detail, headline, setStep, openMemory, save, requestClose } =
    useAiAgentDetailContext();
  const { name, pose, missingParts, summary, memoryChips } =
    useAiAgentProfile();
  const [botSize, setBotSize] = useSessionTab('aiAgentBotSize', 'compact', [
    'compact',
    'large',
  ]);
  const isLarge = botSize === 'large';

  return (
    <header className="shrink-0 border-b px-5 py-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <AiAgentBot
          pose={pose}
          missingParts={missingParts}
          className={cn(
            'transition-[width,height] duration-300 ease-out',
            isLarge ? 'size-40 sm:size-52' : 'size-12 sm:size-16',
          )}
          onPartClick={setStep}
        />

        <div className="min-w-40 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Sheet.Title className="truncate text-base font-semibold">
              {name}
            </Sheet.Title>
            <Badge variant={HEADLINE_VARIANTS[headline.status]}>
              {headline.label}
            </Badge>
            {pose.mood && (
              <span className="text-xs italic text-muted-foreground">
                {pose.mood}
              </span>
            )}
          </div>
          <Sheet.Description className="truncate text-sm text-muted-foreground">
            {summary}
          </Sheet.Description>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {headline.status !== 'done' && (
            <Button variant="outline" onClick={() => setStep(headline.step)}>
              {headline.cta} →
            </Button>
          )}
          {detail?._id && (
            <ApprovalLockButton
              contentType={
                AUTOMATION_APPROVAL_CONTENT_TYPES.AUTOMATION_AI_AGENT
              }
              contentId={detail._id}
              action="edit"
            />
          )}
          <Button onClick={save}>
            <IconDeviceFloppy className="size-4" />
            Save
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={requestClose}
            aria-label="Close"
          >
            <IconX />
          </Button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setBotSize(isLarge ? 'compact' : 'large')}
        aria-expanded={isLarge}
        aria-label={isLarge ? 'Shrink the bot' : 'Enlarge the bot'}
        className="group relative my-1.5 flex h-3 w-full items-center justify-center"
      >
        <span className="absolute inset-x-0 top-1/2 h-px bg-border" />
        <span className="relative h-1.5 w-10 rounded-full bg-muted-foreground/30 transition-colors group-hover:bg-muted-foreground/60" />
      </button>

      {!!memoryChips.length && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs text-muted-foreground">Memory</span>
          {memoryChips.map((chip) => {
            const Icon = chip.icon;

            return (
              <Button
                key={chip.key}
                variant="outline"
                size="sm"
                className="h-6 gap-1 px-2 text-xs"
                onClick={() => openMemory(chip.key)}
              >
                <Icon className="size-3.5" />
                <span className="max-w-40 truncate">{chip.label}</span>
                {chip.warning && (
                  <IconAlertTriangle className="size-3.5 text-warning" />
                )}
              </Button>
            );
          })}
        </div>
      )}
    </header>
  );
};
