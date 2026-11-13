import {
  TBuiltInTemplate,
  TBuiltInTemplateRequirement,
} from '@/automations/utils/builtInTemplates';
import {
  useBuiltInTemplatePreview,
  useInstallBroadcastTemplate,
} from '@/broadcast/components/workflow/hooks/useBroadcastTemplates';
import { toast } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const isAnswered = (value: unknown) =>
  value !== undefined && value !== null && value !== '';

/**
 * Answers asked in order: a requirement opens once every one before it (and
 * the one it depends on) is answered, and installing opens after the last.
 */
export const useBroadcastTemplateInstallDialog = ({
  template,
  onOpenChange,
}: {
  template: TBuiltInTemplate | null;
  onOpenChange: (open: boolean) => void;
}) => {
  const { t } = useTranslation('broadcasts');
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const { preview, loading, error } = useBuiltInTemplatePreview(
    template,
    answers,
  );
  const { installTemplate, installing } = useInstallBroadcastTemplate();
  const requirements = template?.requirements || [];
  const unansweredCount = requirements.filter(
    ({ key }) => !isAnswered(answers[key]),
  ).length;

  const isOpen = (index: number) => {
    const requirement = requirements[index];

    return (
      requirements
        .slice(0, index)
        .every(({ key }) => isAnswered(answers[key])) &&
      (!requirement.dependsOn || isAnswered(answers[requirement.dependsOn]))
    );
  };

  // The step's own template text, where an email is written from
  const defaultValueOf = (requirement: TBuiltInTemplateRequirement) => {
    const order = requirement.fills?.[0]?.order;
    return template?.flow.find((step) => step.order === order)?.config;
  };

  const setAnswer = (key: string, value: unknown) =>
    setAnswers((current) => ({ ...current, [key]: value }));

  const close = () => {
    setAnswers({});
    onOpenChange(false);
  };

  const install = async () => {
    if (!template) {
      return;
    }

    try {
      await installTemplate(template, answers);
      close();
    } catch (installError) {
      toast({
        variant: 'destructive',
        title: t('workflow.install-failed'),
        description:
          installError instanceof Error ? installError.message : undefined,
      });
    }
  };

  return {
    answers,
    preview,
    previewLoading: loading && !preview,
    previewError: error,
    unansweredCount,
    installing,
    isOpen,
    defaultValueOf,
    setAnswer,
    close,
    install,
  };
};
