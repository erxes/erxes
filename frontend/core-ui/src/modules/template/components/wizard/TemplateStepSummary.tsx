import { TTemplateRequirement } from '@/template/types';
import {
  isTemplateAnswered,
  splitTemplatePlaceholders,
  templateAnswerText,
  templateMemberIds,
} from '@/template/utils/templateWizard';
import { useTranslation } from 'react-i18next';
import { MembersInline } from 'ui-modules';

const MEMBER_KINDS = ['core:team.members', 'core:team.member'];

/** What a finished step was answered with, in one line. */
export const TemplateStepSummary = ({
  requirement,
  value,
  label,
}: {
  requirement: TTemplateRequirement;
  value: unknown;
  label?: string;
}) => {
  const { t } = useTranslation('templates');

  if (!isTemplateAnswered(value)) {
    return <span>{t('not-set')}</span>;
  }

  if (MEMBER_KINDS.includes(requirement.kind)) {
    return (
      <MembersInline
        memberIds={templateMemberIds(value)}
        size="default"
        className="text-xs"
      />
    );
  }

  const text =
    label || templateAnswerText(requirement.kind, value) || t('selected');

  return (
    <span className="truncate">
      {splitTemplatePlaceholders(text).map((part, index) =>
        part.isToken ? (
          <code
            key={index}
            className="mx-0.5 rounded bg-primary/10 px-1 py-px font-mono text-[11px] text-primary"
          >
            {part.text}
          </code>
        ) : (
          <span key={index}>{part.text}</span>
        ),
      )}
    </span>
  );
};
