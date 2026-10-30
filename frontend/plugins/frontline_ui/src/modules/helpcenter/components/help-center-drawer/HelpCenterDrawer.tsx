import { Form, Tabs } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { PanelFormLayout } from 'ui-modules';
import { HelpCenterAppearanceTab } from '@/helpcenter/components/help-center-drawer/HelpCenterAppearanceTab';
import { HelpCenterDomainTab } from '@/helpcenter/components/help-center-drawer/HelpCenterDomainTab';
import { HelpCenterGeneralTab } from '@/helpcenter/components/help-center-drawer/HelpCenterGeneralTab';
import {
  EMPTY_HELP_CENTER_FORM,
  HELP_CENTER_FIELD_TAB,
} from '@/helpcenter/constants';
import { useSaveHelpCenter } from '@/helpcenter/hooks/useSaveHelpCenter';
import {
  HELP_CENTER_CREATE_TABS,
  HELP_CENTER_TABS,
  IHelpCenter,
  IHelpCenterConfigInput,
  THelpCenterTab,
} from '@/helpcenter/types';
import { toHelpCenterConfigInput } from '@/helpcenter/utils/toHelpCenterConfigInput';
import { TopicEmbedTab } from '@/knowledgebase/shared/components/TopicEmbedTab';
import { KbFormPanelContext } from '@/knowledgebase/shared/components/KbFormLayout';

interface HelpCenterDrawerProps {
  readonly helpCenter?: IHelpCenter;
  readonly onClose: () => void;
  readonly onSaved?: () => void;
}

export function HelpCenterDrawer({
  helpCenter,
  onClose,
  onSaved,
}: HelpCenterDrawerProps) {
  const { t } = useTranslation('frontline');
  const isEditing = !!helpCenter;
  const [selectedTab, setSelectedTab] = useState<THelpCenterTab>('general');
  const tabs = isEditing ? HELP_CENTER_TABS : HELP_CENTER_CREATE_TABS;
  const activeTab = tabs.find((tab) => tab === selectedTab) || 'general';
  const selectTab = (value: string) => {
    const nextTab = tabs.find((tab) => tab === value);
    if (nextTab) setSelectedTab(nextTab);
  };

  const form = useForm<IHelpCenterConfigInput>({
    defaultValues: EMPTY_HELP_CENTER_FORM,
    mode: 'onChange',
  });

  useEffect(() => {
    form.reset(toHelpCenterConfigInput(helpCenter));
  }, [helpCenter, form]);

  const { saveHelpCenter, loading } = useSaveHelpCenter({
    onSaved: () => {
      onSaved?.();
      onClose();
      form.reset(EMPTY_HELP_CENTER_FORM);
    },
  });

  const onSubmit = (data: IHelpCenterConfigInput) =>
    saveHelpCenter({
      ...data,
      _id: helpCenter?._id,
      title: data.title?.trim(),
      description: data.description?.trim(),
      url: data.url?.trim(),
    });

  const onInvalid = (errors: Record<string, unknown>) => {
    const firstField = Object.keys(errors)[0];
    const tab = Object.entries(HELP_CENTER_FIELD_TAB).find(
      ([field]) => field === firstField,
    )?.[1];
    if (tab && tab !== activeTab) selectTab(tab);
  };

  const submit = form.handleSubmit(onSubmit, onInvalid);

  const kbTopicId = form.watch('kbTopicId');

  const idleLabel = isEditing
    ? t('kb-save-changes')
    : t('helpcenter-create', 'Create Help Center');
  const busyLabel = isEditing ? t('saving') : t('kb-creating');
  const submitLabel = loading ? busyLabel : idleLabel;
  const tabLabels: Record<THelpCenterTab, string> = {
    general: t('general'),
    appearance: t('appearance'),
    embed: t('kb-embed-script'),
    domain: t('customdomain-label'),
  };

  return (
    <KbFormPanelContext.Provider value>
      <Form {...form}>
        <form
          onSubmit={submit}
          className="flex flex-1 min-h-0 min-w-0 flex-col"
        >
          <Tabs
            value={activeTab}
            onValueChange={selectTab}
            className="shrink-0 border-b px-2"
          >
            <Tabs.List className="flex w-full flex-wrap gap-x-2 h-auto">
              {tabs.map((tab) => (
                <Tabs.Trigger
                  key={tab}
                  value={tab}
                  className="min-w-0 px-1.5 text-xs"
                >
                  {tabLabels[tab]}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
          </Tabs>
          <PanelFormLayout
            onCancel={() => !loading && onClose()}
            saving={loading}
            saveLabel={submitLabel}
          >
            <div className={activeTab === 'general' ? '' : 'hidden'}>
              <HelpCenterGeneralTab form={form} t={t} />
            </div>
            <div className={activeTab === 'appearance' ? '' : 'hidden'}>
              <HelpCenterAppearanceTab form={form} t={t} />
            </div>
            {isEditing && (
              <div className={activeTab === 'embed' ? '' : 'hidden'}>
                {kbTopicId ? (
                  <TopicEmbedTab topicId={kbTopicId} t={t} />
                ) : (
                  <p className="p-8 text-sm text-center text-muted-foreground">
                    {t('select-knowledge-base-topic')}
                  </p>
                )}
              </div>
            )}
            {helpCenter?._id && activeTab === 'domain' && (
              <HelpCenterDomainTab
                helpCenterId={helpCenter._id}
                t={t}
                compact
              />
            )}
          </PanelFormLayout>
        </form>
      </Form>
    </KbFormPanelContext.Provider>
  );
}
