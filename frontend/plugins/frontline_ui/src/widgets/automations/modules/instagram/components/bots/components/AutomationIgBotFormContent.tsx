import { IconChevronDown, IconChevronUp, IconPlus } from '@tabler/icons-react';
import {
  Button,
  cn,
  Collapsible,
  Form,
  Input,
  Label,
  Select,
  Separator,
  Sheet,
  Spinner,
  Switch,
  toast,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useAtom } from 'jotai';
import { useState } from 'react';
import { FacebookMessageButtonsGenerator } from '~/widgets/automations/modules/facebook/components/action/components/FacebookMessageButtonsGenerator';
import { InstagramBotPageSelectorSteps } from '~/widgets/automations/modules/instagram/components/bots/components/InstagramBotPageSelectorSteps';
import { InstagramPageInfo } from '~/widgets/automations/modules/instagram/components/bots/components/InstagramPageInfo';
import { useInstagramBotSave } from '~/widgets/automations/modules/instagram/components/bots/hooks/useInstagramBotForm';
import { isOpenInstagramBotSecondarySheet } from '~/widgets/automations/modules/instagram/components/bots/states/instagramBotStates';
import { useIgBotFormContext } from '../context/IgBotFormContext';
import { AutomationBotFormEffect } from './AutomationBotFormEffect';

export const AutomationIgBotFormContent = () => {
  const { t } = useTranslation('frontline');
  const { form } = useIgBotFormContext();
  const [isOptionalOpen, setOptionalOpen] = useState(false);
  const { onSave, onSaveloading } = useInstagramBotSave();
  const [accountId, pageId] = form.watch(['accountId', 'pageId']);

  return (
    <>
      <Sheet.Content className="p-4">
        <Form {...form}>
          <IgBotFormSecondarySheet accountId={accountId} pageId={pageId} />
          <AutomationBotFormEffect />
          <div
            className={cn('flex flex-col gap-4', {
              blur: !accountId || !pageId,
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
            <Form.Field
              control={form.control}
              name="persistentMenus"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('persistent-menu')}</Form.Label>
                  <Form.Description>
                    {t('persistent-menu-description')}
                  </Form.Description>
                  <FacebookMessageButtonsGenerator
                    addButtonContent={
                      <>
                        <IconPlus />
                        {t('add-persistent-menu')}
                      </>
                    }
                    buttons={field.value}
                    setButtons={field.onChange}
                    limit={5}
                  />
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Collapsible open={isOptionalOpen} onOpenChange={setOptionalOpen}>
              <Collapsible.Trigger asChild>
                <Button variant="secondary" className="w-full">
                  <Label className="flex items-center gap-2">
                    {isOptionalOpen ? t('hide') : t('show-optional-configuration')}{' '}
                    {isOptionalOpen ? <IconChevronUp /> : <IconChevronDown />}
                  </Label>
                </Button>
              </Collapsible.Trigger>
              <Collapsible.Content className="flex flex-col gap-4">
                <Form.Field
                  control={form.control}
                  name="tag"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>{t('tag')}</Form.Label>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <Select.Trigger id="messenger-tag" className="mt-1">
                          <Select.Value placeholder={t('select-tag')} />
                        </Select.Trigger>
                        <Select.Content>
                          <Select.Item value="CONFIRMED_EVENT_UPDATE">
                            {t('confirmed-event-update')}
                          </Select.Item>
                          <Select.Item value="POST_PURCHASE_UPDATE">
                            {t('post-purchase-update')}
                          </Select.Item>
                          <Select.Item value="ACCOUNT_UPDATE">
                            {t('account-update')}
                          </Select.Item>
                        </Select.Content>
                      </Select>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  control={form.control}
                  name="greetText"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>{t('greet-message')}</Form.Label>
                      <Input {...field} />
                      <Form.Message />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  control={form.control}
                  name="isEnabledBackBtn"
                  render={({ field }) => (
                    <Form.Item className="flex justify-between">
                      <Form.Label className="mt-3">
                        {t('enable-back-button')}
                      </Form.Label>
                      <Switch
                        className="flex-none"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <Form.Message />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  control={form.control}
                  name="backButtonText"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>{t('back-button-text')}</Form.Label>
                      <Input
                        {...field}
                        disabled={!form.watch('isEnabledBackBtn')}
                      />
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              </Collapsible.Content>
            </Collapsible>
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

const IgBotFormSecondarySheet = ({
  accountId,
  pageId,
}: {
  accountId: string;
  pageId: string;
}) => {
  const { t } = useTranslation('frontline');
  const [isOpenAccountSheet, setOpenAccountSheet] = useAtom(
    isOpenInstagramBotSecondarySheet,
  );

  return (
    <Sheet open={isOpenAccountSheet} onOpenChange={setOpenAccountSheet}>
      <div className="flex justify-between items-center pb-2">
        <InstagramPageInfo accountId={accountId} pageId={pageId} />
        <Sheet.Trigger asChild>
          <Button>{t('select-page')}</Button>
        </Sheet.Trigger>
      </div>
      <Separator />
      <Sheet.View>
        {isOpenAccountSheet && (
          <InstagramBotPageSelectorSteps
            accountId={accountId}
            step={accountId ? 2 : 1}
          />
        )}
      </Sheet.View>
    </Sheet>
  );
};
