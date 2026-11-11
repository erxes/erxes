import { TEMPLATE_INSTALL } from '@/template/graphql/mutations';
import { TEMPLATE_INSTALLATIONS } from '@/template/graphql/queries';
import { TTemplate, TTemplateAnswers } from '@/template/types';
import {
  countUnansweredTemplateSteps,
  firstOpenTemplateStep,
  isTemplateStepOpen,
} from '@/template/utils/templateWizard';
import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

/**
 * The install wizard: answers, which step is shown, which steps are open,
 * and installing once every step has an answer.
 */
export const useTemplateWizard = (template?: TTemplate) => {
  const { t } = useTranslation('templates');
  const { toast } = useToast();
  const navigate = useNavigate();
  const requirements = template?.requirements || [];
  const [answers, setAnswers] = useState<TTemplateAnswers>({});
  const [stepIndex, setStepIndex] = useState(0);
  const [install, { loading: installing }] = useMutation<{
    templateInstall: { _id: string };
  }>(TEMPLATE_INSTALL, {
    refetchQueries: [{ query: TEMPLATE_INSTALLATIONS }],
  });

  const remaining = countUnansweredTemplateSteps(requirements, answers);
  const isStepOpen = useCallback(
    (index: number) => isTemplateStepOpen(requirements, index, answers),
    [requirements, answers],
  );

  const answer = useCallback(
    (key: string, value: unknown) => {
      setAnswers((current) => {
        const next = { ...current, [key]: value };

        // A changed answer can unsettle what depends on it
        for (const requirement of requirements) {
          if (requirement.dependsOn === key) {
            delete next[requirement.key];
          }
        }

        return next;
      });
    },
    [requirements],
  );

  const goToStep = useCallback(
    (index: number) => {
      if (isStepOpen(index)) {
        setStepIndex(index);
      }
    },
    [isStepOpen],
  );

  const goNext = useCallback(() => {
    setStepIndex(firstOpenTemplateStep(requirements, answers));
  }, [requirements, answers]);

  const submit = useCallback(() => {
    if (!template || remaining) {
      return;
    }

    install({
      variables: {
        pluginName: template.pluginName,
        id: template.id,
        answers,
      },
    })
      .then(({ data }) => {
        toast({ variant: 'success', title: t('installed-toast') });
        navigate(`/templates/installations/${data?.templateInstall._id}`);
      })
      .catch((error: Error) =>
        toast({
          variant: 'destructive',
          title: t('install-failed'),
          description: error.message,
        }),
      );
  }, [template, remaining, install, answers, toast, t, navigate]);

  return {
    requirements,
    answers,
    answer,
    stepIndex,
    goToStep,
    goNext,
    isStepOpen,
    remaining,
    submit,
    installing,
  };
};
