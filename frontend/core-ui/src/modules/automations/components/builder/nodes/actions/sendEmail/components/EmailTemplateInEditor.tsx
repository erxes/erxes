import { useTranslation } from 'react-i18next';
import { useEmailTemplateInEditor } from '@/automations/components/builder/nodes/actions/sendEmail/hooks/useEmailTemplateInEditor';
import { IEmailTemplate } from '@/emailTemplates/types';
import {
  DefaultReactSuggestionItem,
  SuggestionMenuController,
} from '@blocknote/react';
import {
  IBlockEditor,
  SlashMenuProps,
  SuggestionMenu,
  SuggestionMenuItem,
} from 'erxes-ui';

interface EmailTemplateInEditorProps {
  editor: IBlockEditor;
}

export const EmailTemplateInEditor = ({
  editor,
}: EmailTemplateInEditorProps) => {
  const { loading, emailTemplates, getItems } =
    useEmailTemplateInEditor(editor);

  return (
    <SuggestionMenuController
      triggerCharacter="@"
      suggestionMenuComponent={(props) => (
        <EmailTemplateMenu
          {...props}
          loading={loading}
          emailTemplates={emailTemplates}
        />
      )}
      getItems={getItems}
    />
  );
};

interface EmailTemplateMenuProps extends SlashMenuProps {
  items: DefaultReactSuggestionItem[];
  emailTemplates?: IEmailTemplate[];
  loading?: boolean;
}

function EmailTemplateMenu({
  items,
  selectedIndex,
  emailTemplates,
  loading,
}: EmailTemplateMenuProps) {
  const { t } = useTranslation('automations');

  if (loading) {
    return (
      <SuggestionMenu>
        <div className="p-2">{t('send-email-loading-templates')}</div>
      </SuggestionMenu>
    );
  }

  if (items.length === 0) {
    return (
      <SuggestionMenu>
        <div className="p-2">{t('send-email-no-templates-found-period')}</div>
      </SuggestionMenu>
    );
  }

  return (
    <SuggestionMenu>
      {items.map((item, index) => (
        <EmailTemplateMenuItem
          key={item.title}
          onClick={item.onItemClick}
          text={item.title}
          isSelected={selectedIndex === index}
          index={index}
          template={emailTemplates?.find(({ name }) => name === item.title)}
        />
      ))}
    </SuggestionMenu>
  );
}

interface EmailTemplateMenuItemProps {
  onClick: () => void;
  isSelected: boolean;
  index: number;
  text: string;
  template?: IEmailTemplate;
}

function EmailTemplateMenuItem({
  onClick,
  isSelected,
  template,
}: EmailTemplateMenuItemProps) {
  return (
    <SuggestionMenuItem
      isSelected={isSelected}
      onClick={onClick}
      className="justify-start cursor-pointer hover:bg-muted"
    >
      <div className="flex flex-col">
        <div className="font-medium">{template?.name}</div>
        {template?.description && (
          <div className="text-sm text-muted-foreground">
            {template.description}
          </div>
        )}
      </div>
    </SuggestionMenuItem>
  );
}
