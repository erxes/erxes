import { useAutomationEmailTemplates } from '@/automations/components/settings/components/email-templates/hooks/useAutomationEmailTemplates';
import { useAutomationEmailTemplateDetailLazy } from '@/automations/components/settings/components/email-templates/hooks/useAutomationEmailTemplateDetailLazy';
import { IAutomationEmailTemplate } from '@/automations/components/settings/components/email-templates/types/automationEmailTemplates';
import { filterSuggestionItems } from '@blocknote/core';
import {
  DefaultReactSuggestionItem,
  SuggestionMenuController,
} from '@blocknote/react';
import {
  IBlockEditor,
  SlashMenuProps,
  SuggestionMenu,
  SuggestionMenuItem,
  useConfirm,
} from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';

interface EmailTemplateInEditorProps {
  editor: IBlockEditor;
}

export const EmailTemplateInEditor = ({
  editor,
}: EmailTemplateInEditorProps) => {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);
  const { confirm } = useConfirm();

  const { emailTemplates = [], loading } = useAutomationEmailTemplates({
    searchValue: debouncedSearch,
  });

  const { loadEmailTemplate, emailTemplate } =
    useAutomationEmailTemplateDetailLazy();

  // Handle template content loading
  useEffect(() => {
    if (emailTemplate?.content) {
      try {
        const blocks = JSON.parse(emailTemplate.content);
        editor.replaceBlocks(editor.document, blocks);
      } catch {
        // If not JSON, treat as plain text
        editor.replaceBlocks(editor.document, [
          {
            id: crypto.randomUUID(),
            type: 'paragraph',
            props: {
              textColor: 'default',
              backgroundColor: 'default',
              textAlignment: 'left',
            },
            content: [
              {
                type: 'text',
                text: emailTemplate.content,
                styles: {},
              },
            ],
            children: [],
          },
        ]);
      }
    }
  }, [emailTemplate?.content, editor]);

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
      getItems={async (query) => {
        setSearch(query);
        return filterSuggestionItems(
          getEmailTemplateMenuItems(
            editor,
            emailTemplates,
            loadEmailTemplate,
            confirm,
          ),
          query,
        );
      }}
    />
  );
};

interface EmailTemplateMenuProps extends SlashMenuProps {
  items: DefaultReactSuggestionItem[];
  emailTemplates?: IAutomationEmailTemplate[];
  loading?: boolean;
}

function EmailTemplateMenu({
  items,
  selectedIndex,
  emailTemplates,
  loading,
}: EmailTemplateMenuProps) {
  if (loading) {
    return (
      <SuggestionMenu>
        <div className="p-2">Loading email templates...</div>
      </SuggestionMenu>
    );
  }

  if (items.length === 0) {
    return (
      <SuggestionMenu>
        <div className="p-2">No email templates found.</div>
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
          template={emailTemplates?.find((t) => t.name === item.title)}
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
  template?: IAutomationEmailTemplate;
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

function getEmailTemplateMenuItems(
  editor: IBlockEditor,
  emailTemplates: IAutomationEmailTemplate[],
  loadEmailTemplate: (id: string) => void,
  confirm: ({
    message,
    options,
  }: {
    message: string;
    options?: any;
  }) => Promise<void>,
): DefaultReactSuggestionItem[] {
  return emailTemplates.map((template) => ({
    title: template.name,
    onItemClick: () => {
      confirm({
        message: `Are you sure you want to set this template to the email content? This will replace the current content.`,
      }).then(() => {
        editor.suggestionMenus.clearQuery();
        editor.suggestionMenus.closeMenu();
        loadEmailTemplate(template._id);
      });
    },
  }));
}
