import { TablerIcon } from '@tabler/icons-react';
import { ScrollArea, Sheet, Sidebar } from 'erxes-ui';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

export type TFormSection<K extends string> = {
  key: K;
  labelKey: string;
  icon: TablerIcon;
  hasError: boolean;
};

// A sheet body split into sections by a sidebar, for long forms: one form,
// one section shown at a time, sections with errors marked.
export const SectionedSheetForm = <K extends string>({
  sections,
  active,
  onSelect,
  children,
}: {
  sections: TFormSection<K>[];
  active: K;
  onSelect: (key: K) => void;
  children: ReactNode;
}) => {
  const { t } = useTranslation('loyalty');

  return (
    <Sheet.Content className="flex-auto flex min-h-0 overflow-hidden">
      <Sidebar
        collapsible="none"
        className="border-r flex-none [--sidebar-width:180px]"
      >
        <Sidebar.Group>
          <Sidebar.GroupContent>
            <Sidebar.Menu>
              {sections.map(({ key, labelKey, icon: Icon, hasError }) => (
                <Sidebar.MenuItem key={key}>
                  <Sidebar.MenuButton
                    // Inside a form: switching must not submit.
                    type="button"
                    isActive={active === key}
                    onClick={() => onSelect(key)}
                  >
                    <Icon />
                    {t(labelKey)}
                    {hasError && (
                      <span
                        className="ml-auto size-2 rounded-full bg-destructive"
                        aria-label={t('score-campaign-section-has-error')}
                      />
                    )}
                  </Sidebar.MenuButton>
                </Sidebar.MenuItem>
              ))}
            </Sidebar.Menu>
          </Sidebar.GroupContent>
        </Sidebar.Group>
      </Sidebar>
      <ScrollArea className="flex-auto h-full">
        <div className="p-5">{children}</div>
      </ScrollArea>
    </Sheet.Content>
  );
};
