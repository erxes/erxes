import { AutomationVariableBrowser } from '@/automations/components/builder/sidebar/components/output-variables/AutomationVariableBrowser';
import { TAutomationVariableSourceNode } from '@/automations/components/builder/sidebar/components/output-variables/AutomationVariableBrowserTypes';
import { EMAIL_LINK_URL_PLACEHOLDER } from '@/automations/components/builder/nodes/actions/sendEmail/utils/emailLinkUtils';
import { IconVariable } from '@tabler/icons-react';
import { Button, Input, Popover } from 'erxes-ui';
import { useSendEmailLinkFields } from '@/automations/components/builder/nodes/actions/sendEmail/hooks/useSendEmailLinkFields';
import { useTranslation } from 'react-i18next';

export const SendEmailLinkFields = ({
  textValue,
  urlValue,
  onTextChange,
  onUrlChange,
  onSubmit,
  variableSourceNodes,
}: {
  textValue: string;
  urlValue: string;
  onTextChange: (value: string) => void;
  onUrlChange: (value: string) => void;
  onSubmit: () => void;
  /** Omit to render the fields without the variable picker. */
  variableSourceNodes?: TAutomationVariableSourceNode[];
}) => {
  const { t } = useTranslation('automations');
  const {
    isVariableOpen,
    setIsVariableOpen,
    handleInsertVariable,
    handleKeyDown,
    handleTextChange,
    handleUrlChange,
  } = useSendEmailLinkFields({
    textValue,
    urlValue,
    onTextChange,
    onUrlChange,
    onSubmit,
  });

  return (
    <div className="flex flex-col gap-2">
      <Input
        value={textValue}
        placeholder={t('link-text')}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
      />
      <div className="flex items-center gap-1">
        <Input
          value={urlValue}
          placeholder={EMAIL_LINK_URL_PLACEHOLDER}
          onChange={handleUrlChange}
          onKeyDown={handleKeyDown}
        />
        {variableSourceNodes && (
          <Popover open={isVariableOpen} onOpenChange={setIsVariableOpen}>
            <Popover.Trigger asChild>
              <Button
                variant="secondary"
                size="icon"
                title={t('insert-link-variable')}
              >
                <IconVariable />
              </Button>
            </Popover.Trigger>
            <Popover.Content align="end" className="w-80 p-0">
              <div className="max-h-80 overflow-y-auto">
                <AutomationVariableBrowser
                  sourceNodes={variableSourceNodes}
                  onInsertVariable={handleInsertVariable}
                  sourceSectionTitle={t('send-email-variable-sources')}
                  emptyState={{
                    title: t('send-email-no-variables-title'),
                    description: t('send-email-no-variables-link-description'),
                  }}
                />
              </div>
            </Popover.Content>
          </Popover>
        )}
      </div>
    </div>
  );
};
