import {
  Button,
  FocusSheet,
  Form,
  ScrollArea,
  Sheet,
  useQueryState,
} from 'erxes-ui';
import { useEffect, useState } from 'react';
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
  HELP_CENTER_TABS,
  IHelpCenter,
  IHelpCenterConfigInput,
  THelpCenterTab,
} from '@/helpcenter/types';
import { toHelpCenterConfigInput } from '@/helpcenter/utils/toHelpCenterConfigInput';
import { TopicEmbedScriptDialog } from '@/knowledgebase/components/TopicEmbedScriptDialog';

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
  const [scriptDialogOpen, setScriptDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useQueryState<string>('tab');
  const activeTab: THelpCenterTab = HELP_CENTER_TABS.includes(
    selectedTab as THelpCenterTab,
  )
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

  return (
    <FocusSheet
      modal
      open={isOpen}
      onOpenChange={(open: boolean) => !open && handleClose()}
    >
      <FocusSheet.View className="lg:w-3/4">
        <FocusSheet.Header
          title={isEditing ? t('kb-edit-topic') : t('kb-new-topic')}
        />
        <FocusSheet.Content className="flex-1 min-h-0">
          <FocusSheet.SideBar>
            <SheetNavSidebar
              tabs={[...HELP_CENTER_TABS]}
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
                  <HelpCenterGeneralTab
                    form={form}
                    isEditing={isEditing}
                    onViewScript={() => setScriptDialogOpen(true)}
                    t={t}
                  />
                </div>

                <div className={activeTab === 'appearance' ? '' : 'hidden'}>
                  <HelpCenterAppearanceTab control={form.control} t={t} />
                </div>
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
            {loading
              ? isEditing
                ? t('saving')
                : t('kb-creating')
              : isEditing
                ? t('kb-save-changes')
                : t('kb-create-topic')}
          </Button>
        </Sheet.Footer>
      </FocusSheet.View>

      {isEditing && kbTopicId && (
        <TopicEmbedScriptDialog
          topicId={kbTopicId}
          open={scriptDialogOpen}
          onOpenChange={setScriptDialogOpen}
          t={t}
        />
      )}
    </FocusSheet>
  );
}
