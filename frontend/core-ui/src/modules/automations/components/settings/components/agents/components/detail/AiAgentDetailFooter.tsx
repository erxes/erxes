import { useAiAgentDetailContext } from '@/automations/components/settings/components/agents/context/AiAgentDetailContext';
import { AUTOMATION_APPROVAL_CONTENT_TYPES } from '@/automations/constants';
import { IconDeviceFloppy } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { ApprovalLockButton } from 'ui-modules';

export const AiAgentDetailFooter = () => {
  const { detail, headline, setStep, save } = useAiAgentDetailContext();

  return (
    <footer className="flex shrink-0 items-center gap-2 border-t px-5 py-3">
      {headline.status !== 'done' && (
        <Button variant="outline" onClick={() => setStep(headline.step)}>
          {headline.cta} →
        </Button>
      )}
      <div className="ml-auto flex items-center gap-2">
        {detail?._id && (
          <ApprovalLockButton
            contentType={AUTOMATION_APPROVAL_CONTENT_TYPES.AUTOMATION_AI_AGENT}
            contentId={detail._id}
            action="edit"
          />
        )}
        <Button onClick={save}>
          <IconDeviceFloppy className="size-4" />
          Save
        </Button>
      </div>
    </footer>
  );
};
