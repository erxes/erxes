import {
  Button,
  FocusSheet,
  Form,
  ScrollArea,
  Sheet,
  useQueryState,
} from 'erxes-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SheetNavSidebar } from 'ui-modules';
import { HelpCenterAppearanceTab } from '@/helpcenter/components/help-center-drawer/HelpCenterAppearanceTab';
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
import { TopicEmbedTab } from '@/knowledgebase/components/TopicEmbedTab';

interface HelpCenterDrawerProps {
  readonly helpCenter?: IHelpCenter;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSaved?: () => void;
}

export function HelpCenterDrawer({
  helpCenter,
  isOpen,
  onClose,
  onSaved,
}: HelpCenterDrawerProps) {
  const { t } = useTranslation('frontline');
  const isEditing = !!helpCenter;
  const [selectedTab, setSelectedTab] = useQueryState<string>('tab');

  const tabs = isEditing ? HELP_CENTER_TABS : HELP_CENTER_CREATE_TABS;
  const activeTab: THelpCenterTab = tabs.includes(selectedTab as THelpCenterTab)
    ? (selectedTab as THelpCenterTab)
    : 'general';

  const form = useForm<IHelpCenterConfigInput>({
    defaultValues: EMPTY_HELP_CENTER_FORM,
    mode: 'onChange',
  });

  const handleClose = () => {
    setSelectedTab(null);
    onClose();
  };

  useEffect(() => {
    form.reset(toHelpCenterConfigInput(helpCenter));
  }, [helpCenter, form]);

  const { saveHelpCenter, loading } = useSaveHelpCenter({
    onSaved: () => {
      onSaved?.();
      handleClose();
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
    const firstField = Object.keys(errors)[0] as
      | keyof IHelpCenterConfigInput
      | undefined;

    if (firstField && HELP_CENTER_FIELD_TAB[firstField] !== activeTab) {
      setSelectedTab(HELP_CENTER_FIELD_TAB[firstField]);
    }
  };

  const submit = form.handleSubmit(onSubmit, onInvalid);

  const kbTopicId = form.watch('kbTopicId');

  const idleLabel = isEditing
    ? t('kb-save-changes')
    : t('helpcenter-create', 'Create Help Center');
  const busyLabel = isEditing ? t('saving') : t('kb-creating');
  const submitLabel = loading ? busyLabel : idleLabel;

  return (
    <FocusSheet
      modal
      open={isOpen}
      onOpenChange={(open: boolean) => !open && handleClose()}
    >
      <FocusSheet.View className="lg:w-3/4">
        <FocusSheet.Header
          title={
            isEditing
              ? t('helpcenter-edit', 'Edit Help Center')
              : t('helpcenter-new', 'New Help Center')
          }
        />
        <FocusSheet.Content className="flex-1 min-h-0">
          <FocusSheet.SideBar>
            <SheetNavSidebar
              tabs={[...tabs]}
              groupLabel={t('kb-topic', 'Help center')}
            />
          </FocusSheet.SideBar>

          <Form {...form}>
            <form
              onSubmit={submit}
              className="flex overflow-hidden flex-col flex-1 min-w-0"
            >
              <ScrollArea className="flex-1" viewportClassName="p-4">
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
              </ScrollArea>
            </form>
          </Form>
        </FocusSheet.Content>

        <Sheet.Footer className="flex gap-1 justify-end border-t shrink-0 bg-background p-2.5">
          <Button
            type="button"
            onClick={handleClose}
            variant="outline"
            disabled={loading}
          >
            {t('cancel')}
          </Button>
          <Button type="submit" disabled={loading} onClick={submit}>
            {submitLabel}
          </Button>
        </Sheet.Footer>
      </FocusSheet.View>
    </FocusSheet>
  );
}
