import { TEMPLATE_INSTALL } from '@/template/graphql/mutations';
import { TEMPLATE_INSTALLATIONS } from '@/template/graphql/queries';
import {
  reinstallConfirmOf,
  useTemplatePriorInstalls,
} from '@/template/hooks/useTemplatePriorInstalls';
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
import { installedPathOf } from '@/template/utils/installedPath';
import { useConfirm, useToast } from 'erxes-ui';
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
  const { confirm } = useConfirm();
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
    templateInstall: {
      _id: string;
      partIds?: Record<string, string>;
      automationIds?: Record<string, string>;
    };
  }>(TEMPLATE_INSTALL, {
    // Lists that show what it made
    refetchQueries: [
      { query: TEMPLATE_INSTALLATIONS },
      'AutomationsMain',
      'AutomationFolders',
    ],
  });

  const remaining = countUnansweredTemplateSteps(ordered, answers);
  const priorInstalls = useTemplatePriorInstalls(template);

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

  const runInstall = useCallback(() => {
    if (!template) {
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

        if (data?.templateInstall) {
          navigate(installedPathOf(template, data.templateInstall));
        }
      })
      .catch((error: Error) =>
        toast({
          variant: 'destructive',
          title: t('install-failed'),
          description: error.message,
        }),
      );
  }, [template, install, answers, toast, t, navigate]);

  // Installing again makes a second copy of everything; say so first
  const confirmReinstall = useCallback(() => {
    if (!template) {
      return;
    }

    const { key, values } = reinstallConfirmOf(template, priorInstalls);

    confirm({
      message: t(key, values),
      options: { okLabel: t('install-again') },
    }).then(runInstall);
  }, [template, priorInstalls, confirm, t, runInstall]);

  const submit = useCallback(() => {
    if (!template || remaining) {
      return;
    }

    if (priorInstalls.installations.length) {
      confirmReinstall();
    } else {
      runInstall();
    }
  }, [template, remaining, priorInstalls, confirmReinstall, runInstall]);

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
    priorInstalls,
  };
};

export type TTemplateWizardState = ReturnType<typeof useTemplateWizard>;
