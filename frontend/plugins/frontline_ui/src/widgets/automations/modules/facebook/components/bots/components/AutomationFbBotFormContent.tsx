import { useTranslation } from 'react-i18next';
import {
  Button,
  cn,
  Form,
  Input,
  Separator,
  Sheet,
  Spinner,
  Tabs,
  toast,
} from 'erxes-ui';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { FacebookBotPageSelectorSteps } from '~/widgets/automations/modules/facebook/components/bots/components/FacebookBotPageSelectorSteps';
import { FacebookPageInfo } from '~/widgets/automations/modules/facebook/components/bots/components/FacebookPageInfo';
import { useFacebookBotSave } from '~/widgets/automations/modules/facebook/components/bots/hooks/useFacebookBotForm';
import {
  facebookBotFormTabState,
  isOpenFacebookBotSecondarySheet,
  TFacebookBotFormTab,
} from '~/widgets/automations/modules/facebook/components/bots/states/facebookBotStates';
import { FacebookBotAutomations } from '~/widgets/automations/modules/facebook/components/bots/components/FacebookBotAutomations';
import { FacebookBotCommentActivity } from '~/widgets/automations/modules/facebook/components/bots/components/FacebookBotCommentActivity';
import { FacebookBotProfileHealth } from '~/widgets/automations/modules/facebook/components/bots/components/FacebookBotProfileHealth';
import { FacebookBotSettingsTab } from '~/widgets/automations/modules/facebook/components/bots/components/FacebookBotSettingsTab';
import { useFbBotFormContext } from '../context/FbBotFormContext';
import { AutomationBotFormEffect } from './AutomationBotFormEffect';

export const AutomationFbBotFormContent = ({
  isPageFixed,
}: {
  // The page came from the caller, so the selector and its gate are dropped.
  isPageFixed?: boolean;
} = {}) => {
  const { t } = useTranslation('frontline');
  const { form, facebookMessengerBot } = useFbBotFormContext();
  const [activeTab, setActiveTab] = useAtom(facebookBotFormTabState);
  const { onSave, onSaveloading } = useFacebookBotSave(
    facebookMessengerBot?._id,
  );
  const [accountId, pageId, persistentMenus] = form.watch([
    'accountId',
    'pageId',
    'persistentMenus',
  ]);
  const hasBackButtonMenu = persistentMenus?.some(
    (menu) => menu.type === 'back_button',
  );

  useEffect(() => {
    form.setValue('isEnabledBackBtn', Boolean(hasBackButtonMenu));
  }, [form, hasBackButtonMenu]);

  return (
    <>
      <Sheet.Content className="overflow-y-auto p-4">
        <Form {...form}>
          {isPageFixed ? (
            <div className="flex items-center pb-2">
              <FacebookPageInfo accountId={accountId} pageId={pageId} />
            </div>
          ) : (
            <FbBotFormSecondarySheet accountId={accountId} pageId={pageId} />
          )}
          <AutomationBotFormEffect isPageFixed={isPageFixed} />
          <div
            className={cn('flex flex-col gap-4', {
              blur: !isPageFixed && (!accountId || !pageId),
            })}
          >
            <Form.Field
              control={form.control}
              name="name"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('name')}</Form.Label>

                  <Input {...field} />
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Tabs
              value={activeTab}
              onValueChange={(value) =>
                setActiveTab(value as TFacebookBotFormTab)
              }
            >
              <Tabs.List className="grid w-full grid-cols-2">
                <Tabs.Trigger value="settings">
                  {t('bot-tab-settings', { defaultValue: 'Settings' })}
                </Tabs.Trigger>
                <Tabs.Trigger value="activity">
                  {t('bot-tab-activity', { defaultValue: 'Activity' })}
                </Tabs.Trigger>
              </Tabs.List>
              <Tabs.Content
                value="settings"
                className="flex flex-col gap-4 pt-4"
              >
                <FacebookBotSettingsTab />
              </Tabs.Content>
              <Tabs.Content
                value="activity"
                className="flex flex-col gap-4 pt-4"
              >
                <FacebookBotProfileHealth bot={facebookMessengerBot} />
                <Separator />
                <FacebookBotAutomations botId={facebookMessengerBot?._id} />
                <Separator />
                <FacebookBotCommentActivity bot={facebookMessengerBot} />
              </Tabs.Content>
            </Tabs>
          </div>
        </Form>
      </Sheet.Content>
      <Sheet.Footer>
        <Button
          disabled={onSaveloading}
          onClick={form.handleSubmit(onSave, (error) =>
            toast({
              title: t('something-went-wrong'),
              description: JSON.stringify(error),
            }),
          )}
        >
          {onSaveloading ? <Spinner /> : t('save')}
        </Button>
      </Sheet.Footer>
    </>
  );
};

const FbBotFormSecondarySheet = ({
  accountId,
  pageId,
}: {
  accountId: string;
  pageId: string;
}) => {
  const { t } = useTranslation('frontline');
  const [isOpenAccountSheet, setOpenAccountSheet] = useAtom(
    isOpenFacebookBotSecondarySheet,
  );

  return (
    <Sheet open={isOpenAccountSheet} onOpenChange={setOpenAccountSheet}>
      <div className="flex justify-between items-center pb-2">
        <FacebookPageInfo accountId={accountId} pageId={pageId} />
        <Sheet.Trigger asChild>
          <Button>{t('select-page')}</Button>
        </Sheet.Trigger>
      </div>
      <Separator />
      <Sheet.View>
        {isOpenAccountSheet && (
          <FacebookBotPageSelectorSteps
            accountId={accountId}
            step={accountId ? 2 : 1}
          />
        )}
      </Sheet.View>
    </Sheet>
  );
};
