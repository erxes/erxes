import { TEMPLATE_INSTALL } from '@/template/graphql/mutations';
import { TEMPLATE_INSTALLATIONS } from '@/template/graphql/queries';
import { TTemplate, TTemplateAnswers } from '@/template/types';
import {
  countUnansweredTemplateSteps,
  defaultTemplateAnswers,
  firstUnansweredTemplateStep,
  groupTemplateRequirements,
  isTemplateStepOpen,
  orderTemplateRequirements,
} from '@/template/utils/templateWizard';
import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { currentUserState } from 'ui-modules';

/**
 * The install wizard: answers seeded with defaults, the one step that is
 * open for editing, what each answer is called, and installing once every
 * step has an answer. Steps open in order; a step waits for those before it.
 */
export const useTemplateWizard = (template?: TTemplate) => {
  const { t } = useTranslation('templates');
  const { toast } = useToast();
  const navigate = useNavigate();
  const currentUser = useAtomValue(currentUserState);
  const ordered = useMemo(
    () => orderTemplateRequirements(template?.requirements || []),
    [template],
  );
  const groups = useMemo(() => groupTemplateRequirements(ordered), [ordered]);
  const [answers, setAnswers] = useState<TTemplateAnswers>({});
  const [initial, setInitial] = useState<TTemplateAnswers>({});
  const [labels, setLabels] = useState<Record<string, string>>({});
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  // Seeded once per template, so a refetch never wipes what was answered
  const seededFor = useRef('');

  useEffect(() => {
    const templateKey = template ? `${template.pluginName}:${template.id}` : '';

    if (template && seededFor.current !== templateKey) {
      seededFor.current = templateKey;
      const defaults = defaultTemplateAnswers(ordered, currentUser?._id);

      setAnswers(defaults);
      setInitial(defaults);
      setExpandedKey(firstUnansweredTemplateStep(ordered, defaults));
    }
  }, [template, ordered, currentUser?._id]);

  const [install, { loading: installing }] = useMutation<{
    templateInstall: { _id: string };
  }>(TEMPLATE_INSTALL, {
    refetchQueries: [{ query: TEMPLATE_INSTALLATIONS }],
  });

  const remaining = countUnansweredTemplateSteps(ordered, answers);

  const isStepOpen = useCallback(
    (index: number) => isTemplateStepOpen(ordered, index, answers),
    [ordered, answers],
  );

  const answer = useCallback(
    (key: string, value: unknown) => {
      setAnswers((current) => {
        const next = { ...current, [key]: value };

        // A changed answer can unsettle what depends on it
        for (const requirement of ordered) {
          if (requirement.dependsOn === key) {
            delete next[requirement.key];
          }
        }

        return next;
      });
    },
    [ordered],
  );

  const setLabel = useCallback((key: string, label: string | null) => {
    setLabels((current) => {
      if ((current[key] ?? null) === label) {
        return current;
      }

      const next = { ...current };

      if (label) {
        next[key] = label;
      } else {
        delete next[key];
      }

      return next;
    });
  }, []);

  // Opening a finished step edits it; opening the open one closes it
  const expand = useCallback(
    (key: string) => {
      const index = ordered.findIndex((requirement) => requirement.key === key);

      if (index !== -1 && isStepOpen(index)) {
        setExpandedKey((current) => (current === key ? null : key));
      }
    },
    [ordered, isStepOpen],
  );

  // Done with a step: on to the first one still waiting, if any
  const complete = useCallback(() => {
    setExpandedKey(firstUnansweredTemplateStep(ordered, answers));
  }, [ordered, answers]);

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
        navigate(
          `/templates/installations/${data?.templateInstall._id}?installed=1`,
        );
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
    template,
    ordered,
    groups,
    answers,
    initial,
    labels,
    expandedKey,
    isStepOpen,
    answer,
    setLabel,
    expand,
    complete,
    total: ordered.length,
    done: ordered.length - remaining,
    remaining,
    submit,
    installing,
  };
};

export type TTemplateWizardState = ReturnType<typeof useTemplateWizard>;
