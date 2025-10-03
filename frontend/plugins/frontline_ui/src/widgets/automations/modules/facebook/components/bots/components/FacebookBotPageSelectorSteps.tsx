import {
  selectedFacebookAccountAtom,
  selectedFacebookPageAtom,
} from '@/integrations/facebook/states/facebookStates';
import { Badge, Button, cn, Sheet } from 'erxes-ui';
import { useAtom, useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';
import { FacebookBotPageAccountsStep } from '~/widgets/automations/modules/facebook/components/bots/components/FacebookBotPageAccountsStep';
import { FacebookBotPagesStep } from '~/widgets/automations/modules/facebook/components/bots/components/FacebookBotPagesStep';
import { isOpenFacebookBotSecondarySheet } from '~/widgets/automations/modules/facebook/components/bots/states/facebookBotStates';

const useActionButton = (accountId?: string) => {
  const [activeStep, setStep] = useState(1);

  const selectedAccountId =
    useAtomValue(selectedFacebookAccountAtom) || accountId;
  const selectedPageId = useAtomValue(selectedFacebookPageAtom);
  const [isOpenAccountSheet, setOpenAccountSheet] = useAtom(
    isOpenFacebookBotSecondarySheet,
  );

  const isLastStep = activeStep === 2 && selectedAccountId && selectedPageId;

  const onClick = () => {
    if (isLastStep) {
      isOpenAccountSheet && setOpenAccountSheet(false);
      return;
    }
    setStep(activeStep + 1);
  };

  return {
    text: isLastStep ? 'Save' : 'Next step',
    disabled:
      activeStep === 2
        ? !selectedAccountId || !selectedPageId
        : !selectedAccountId,
    onClick,
    activeStep,
    setStep,
  };
};

export const FacebookBotPageSelectorSteps = ({
  step,
  accountId,
}: {
  step: number;
  accountId?: string;
}) => {
  const { onClick, disabled, text, activeStep, setStep } =
    useActionButton(accountId);

  useEffect(() => {
    setStep(step);
  }, [step]);

  return (
    <>
      <Sheet.Header className="p-5 ">
        <div className="flex items-center gap-2">
          <Badge className="rounded-xl text-xs font-mono">
            STEP {activeStep}
          </Badge>
          <h2 className="text-primary font-semibold text-base">Connect Page</h2>
        </div>

        <Sheet.Close />
      </Sheet.Header>
      <Sheet.Content>
        <div className="p-5 flex flex-col gap-3">
          <div className="flex items-center gap-1 w-full">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  'h-1 flex-1 rounded-full bg-muted',
                  activeStep === index + 1 && 'bg-primary',
                )}
              />
            ))}
          </div>
          <div className="text-xs text-accent-foreground">
            Select a page to link your bot to.
          </div>
        </div>
        {activeStep === 1 && (
          <FacebookBotPageAccountsStep accountId={accountId} />
        )}
        {activeStep === 2 && <FacebookBotPagesStep />}
      </Sheet.Content>
      <Sheet.Footer>
        <Button
          variant="secondary"
          className="bg-border"
          onClick={() => setStep(1)}
          disabled={activeStep === 1}
        >
          Previous step
        </Button>
        <Button onClick={onClick} disabled={disabled}>
          {text}
        </Button>
      </Sheet.Footer>
    </>
  );
};
