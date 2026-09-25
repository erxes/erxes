import { AutomationVariableBrowser } from '@/automations/components/builder/sidebar/components/output-variables/AutomationVariableBrowser';
import { TAutomationVariableSourceNode } from '@/automations/components/builder/sidebar/components/output-variables/AutomationVariableBrowserTypes';
import { EMAIL_LINK_URL_PLACEHOLDER } from '@/automations/components/builder/nodes/actions/sendEmail/utils/emailLinkUtils';
import { IconVariable } from '@tabler/icons-react';
import { Button, Input, Popover } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TAutomationVariableDragPayload } from 'ui-modules';

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
  const [isVariableOpen, setIsVariableOpen] = useState(false);

  const handleInsertVariable = (payload: TAutomationVariableDragPayload) => {
    onUrlChange(`${urlValue}${payload.token}`);

    if (!textValue.trim()) {
      onTextChange(payload.label);
    }

    setIsVariableOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Input
        value={textValue}
        placeholder={t('link-text')}
        onChange={(event) => onTextChange(event.currentTarget.value)}
        onKeyDown={handleKeyDown}
      />
      <div className="flex items-center gap-1">
        <Input
          value={urlValue}
          placeholder={EMAIL_LINK_URL_PLACEHOLDER}
          onChange={(event) => onUrlChange(event.currentTarget.value)}
          onKeyDown={handleKeyDown}
        />
        {variableSourceNodes ? (
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
                  sourceSectionTitle="Variable Sources"
                  emptyState={{
                    title: 'No variables available yet',
                    description:
                      'Add a trigger or an earlier action to use its values in the link URL.',
                  }}
                />
              </div>
            </Popover.Content>
          </Popover>
        ) : null}
      </div>
    </div>
  );
};
