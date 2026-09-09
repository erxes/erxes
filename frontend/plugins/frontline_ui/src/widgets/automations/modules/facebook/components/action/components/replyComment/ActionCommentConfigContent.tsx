import { Badge } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { AutomationActionNodeConfigProps } from 'ui-modules';
import { toCommentActionFormValues } from '~/widgets/automations/modules/facebook/components/action/states/replyCommentActionForm';

export const ActionCommentConfigContent = ({
  config,
}: AutomationActionNodeConfigProps<{ text?: string; texts?: string[] }>) => {
  const { t } = useTranslation('frontline');
  const { texts } = toCommentActionFormValues(config);

  return (
    <div className="flex flex-col gap-1 p-2">
      <div className="flex items-center gap-2">
        <span className="truncate">{texts[0]}</span>
        {texts.length > 1 && (
          <Badge variant="secondary">
            {/* `extra`, not `count`: i18next would read `count` as a plural
                selector and look for suffixed keys that do not exist. */}
            {t('n-variants', {
              defaultValue: '+{{extra}} more',
              extra: texts.length - 1,
            })}
          </Badge>
        )}
      </div>
    </div>
  );
};
