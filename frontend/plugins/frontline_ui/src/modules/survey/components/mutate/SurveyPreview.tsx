import {
  IconDeviceImacFilled,
  IconDeviceIpadFilled,
  IconDeviceMobileFilled,
} from '@tabler/icons-react';
import { Separator, ToggleGroup } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSurvey } from '@/inbox/conversation-messages/components/MessageSurvey';
import { IMessageSurvey } from '@/inbox/types/Conversation';
import {
  surveySetupConfirmationAtom,
  surveySetupContentAtom,
  surveySetupGeneralAtom,
} from '@/survey/states/surveySetupStates';

const PREVIEW_WIDTHS = {
  desktop: 'max-w-xl',
  tablet: 'max-w-md',
  mobile: 'max-w-xs',
} as const;

type PreviewWidth = keyof typeof PREVIEW_WIDTHS;

export const SurveyPreview = () => {
  const { t } = useTranslation('frontline');
  const [width, setWidth] = useState<PreviewWidth>('desktop');
  const general = useAtomValue(surveySetupGeneralAtom);
  const content = useAtomValue(surveySetupContentAtom);
  const confirmation = useAtomValue(surveySetupConfirmationAtom);

  const stepLabel = t('survey-step', 'Step');

  const survey: IMessageSurvey = {
    question: '',
    answers: [],
    steps: content.steps.map((step, index) => ({
      stepId: step.key,
      name: step.name || `${stepLabel} ${index + 1}`,
      description: step.description,
      question:
        step.question || t('survey-question-placeholder', 'Ask something…'),
      allowMultiselect: step.allowMultiselect,
      answers: step.options.map((option, optionIndex) => ({
        id: option.key,
        text:
          option.text || `${t('survey-option', 'Option')} ${optionIndex + 1}`,
      })),
    })),
    expiry: confirmation.durationHours
      ? new Date(
          Date.now() + confirmation.durationHours * 3_600_000,
        ).toISOString()
      : undefined,
  };

  return (
    <>
      <div className="bg-background flex-none">
        <ToggleGroup
          type="single"
          value={width}
          onValueChange={(value) => value && setWidth(value as PreviewWidth)}
          className="text-muted-foreground py-2"
        >
          <ToggleGroup.Item value="desktop" title={t('desktop', 'Desktop')}>
            <IconDeviceImacFilled className="h-3.5 w-3.5" />
            <span>{t('desktop', 'Desktop')}</span>
          </ToggleGroup.Item>
          <ToggleGroup.Item value="tablet" title={t('tablet', 'Tablet')}>
            <IconDeviceIpadFilled className="h-3.5 w-3.5" />
            <span>{t('tablet', 'Tablet')}</span>
          </ToggleGroup.Item>
          <ToggleGroup.Item value="mobile" title={t('mobile', 'Mobile')}>
            <IconDeviceMobileFilled className="h-3.5 w-3.5" />
            <span>{t('mobile', 'Mobile')}</span>
          </ToggleGroup.Item>
        </ToggleGroup>
      </div>
      <Separator />
      <div className="flex-auto overflow-y-auto bg-sidebar p-6">
        <div className={`mx-auto w-full ${PREVIEW_WIDTHS[width]}`}>
          <p className="mb-2 truncate text-sm font-medium text-muted-foreground">
            {general.title ||
              t('survey-title-placeholder', 'Internal name for this survey')}
          </p>
          <MessageSurvey survey={survey} />
        </div>
      </div>
    </>
  );
};
