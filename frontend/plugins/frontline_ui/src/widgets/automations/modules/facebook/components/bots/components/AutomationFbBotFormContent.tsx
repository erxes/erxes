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
import { useAtom } from 'jotai';
import { useState } from 'react';
import { FacebookMessageButtonsGenerator } from '~/widgets/automations/modules/facebook/components/action/components/FacebookMessageButtonsGenerator';
import { FacebookBotPageSelectorSteps } from '~/widgets/automations/modules/facebook/components/bots/components/FacebookBotPageSelectorSteps';
import { FacebookPageInfo } from '~/widgets/automations/modules/facebook/components/bots/components/FacebookPageInfo';
import { useFacebookBotSave } from '~/widgets/automations/modules/facebook/components/bots/hooks/useFacebookBotForm';
import { isOpenFacebookBotSecondarySheet } from '~/widgets/automations/modules/facebook/components/bots/states/facebookBotStates';
import { useFbBotFormContext } from '../context/FbBotFormContext';
import { AutomationBotFormEffect } from './AutomationBotFormEffect';

export const AutomationFbBotFormContent = () => {
  const { form } = useFbBotFormContext();
  const [isOptionalOpen, setOptionalOpen] = useState(false);
  const { onSave, onSaveloading } = useFacebookBotSave();
  const [accountId, pageId] = form.watch(['accountId', 'pageId']);

  return (
    <>
      <Sheet.Content className="p-4">
        <Form {...form}>
          <FbBotFormSecondarySheet accountId={accountId} pageId={pageId} />
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
                  <Form.Label>Name</Form.Label>

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
                  <Form.Label>Persistent Menu</Form.Label>
                  <Form.Description>
                    Configure menu items that appear in your bot
                  </Form.Description>
                  <FacebookMessageButtonsGenerator
                    addButtonContent={
                      <>
                        <IconPlus />
                        Add persistent menu
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
                    {isOptionalOpen ? 'Hide' : 'Show'} Optional configuration{' '}
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
                      <Form.Label>Tag</Form.Label>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <Select.Trigger id="messenger-tag" className="mt-1">
                          <Select.Value placeholder="Select tag" />
                        </Select.Trigger>
                        <Select.Content>
                          <Select.Item value="CONFIRMED_EVENT_UPDATE">
                            Confirmed Event Update
                          </Select.Item>
                          <Select.Item value="POST_PURCHASE_UPDATE">
                            Post-Purchase Update
                          </Select.Item>
                          <Select.Item value="ACCOUNT_UPDATE">
                            Account Update
                          </Select.Item>
                        </Select.Content>
                      </Select>
                      <span className="text-accent-foreground">
                        Message tags may not be used to send promotional
                        content, including but not limited to deals,purchases
                        offers, coupons, and discounts. Use of tags outside of
                        the approved use cases may result in restrictions on the
                        Page's ability to send messages.
                        <a
                          href="https://developers.facebook.com/docs/messenger-platform/send-messages/message-tags/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-500/70 transition ease-in-out"
                        >
                          Learn more
                        </a>
                      </span>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  control={form.control}
                  name="greetText"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Greet Message</Form.Label>
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
                        Enable Back Button on Persistence menu
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
                      <Form.Label>Back Button Text</Form.Label>
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
              title: 'Something went wrong',
              description: JSON.stringify(error),
            }),
          )}
        >
          {onSaveloading ? <Spinner /> : 'Save'}
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
  const [isOpenAccountSheet, setOpenAccountSheet] = useAtom(
    isOpenFacebookBotSecondarySheet,
  );

  return (
    <Sheet open={isOpenAccountSheet} onOpenChange={setOpenAccountSheet}>
      <div className="flex justify-between items-center pb-2">
        <FacebookPageInfo accountId={accountId} pageId={pageId} />
        <Sheet.Trigger asChild>
          <Button>Select Page</Button>
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
