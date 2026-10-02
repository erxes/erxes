import { useTranslation } from 'react-i18next';
import { useReportNodeIssues } from 'ui-modules';
import { TSplitConditionsConfigForm } from '../states/splitConditionsConfigForm';

/** A branch without a segment or conditions never matches. */
export const useSplitNodeIssues = (config?: TSplitConditionsConfigForm) => {
  const { t } = useTranslation('automations');
  const options = config?.options || [];

  useReportNodeIssues(
    options.length
      ? options
          .filter(
            ({ segmentId, config: optionConfig }) =>
              !segmentId && !optionConfig?.conditions?.length,
          )
          .map(({ label }) => t('node-issue-split-branch', { label }))
      : [t('node-issue-split-no-options')],
  );
};
