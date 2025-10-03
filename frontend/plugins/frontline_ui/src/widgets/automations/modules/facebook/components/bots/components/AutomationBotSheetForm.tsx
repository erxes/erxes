import { GET_FB_PAGES } from '@/integrations/facebook/graphql/queries/fbAccounts';
import { IntegrationType } from '@/types/Integration';
import { useQuery } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconCircleCheck,
  IconExternalLink,
  IconInfoTriangle,
  IconPlus,
} from '@tabler/icons-react';
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
  useQueryState,
} from 'erxes-ui';
import { atom, useAtom, useAtomValue } from 'jotai';
import { memo, useEffect, useMemo, useState } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { Link } from 'react-router';
import { FacebookMessageButtonsGenerator } from '~/widgets/automations/modules/facebook/components/action/components/FacebookMessageButtonsGenerator';
import { FacebookBotPageSelectorSteps } from '~/widgets/automations/modules/facebook/components/bots/components/FacebookBotPageSelectorSteps';
import {
  useFacebookBotForm,
  useFacebookBotSave,
} from '~/widgets/automations/modules/facebook/components/bots/hooks/useFacebookBotForm';
import {
  facebookBotFormSchema,
  TFacebookBotForm,
} from '~/widgets/automations/modules/facebook/components/bots/states/facebookBotForm';
import { isOpenFacebookBotSecondarySheet } from '~/widgets/automations/modules/facebook/components/bots/states/facebookBotStates';

const AutomationBotForm = ({
  facebookBotId,
}: {
  facebookBotId: string | null;
}) => {
  const { loadingDetail, atomAccountId, atomPageId, formDefaultValues } =
    useFacebookBotForm(facebookBotId);

  const form = useForm<TFacebookBotForm>({
    resolver: zodResolver(facebookBotFormSchema),
    defaultValues: formDefaultValues,
  });

  useEffect(() => {
    if (atomAccountId) {
      form.setValue('accountId', atomAccountId);
    }
    if (atomPageId) {
      form.setValue('pageId', atomPageId);
    }
  }, [atomAccountId, atomPageId]);

  if (loadingDetail) {
    return <Spinner />;
  }
  return (
    <>
      <Sheet.Header>
        <Sheet.Title>
          {facebookBotId ? 'Edit' : 'Add new'} facebook bot
        </Sheet.Title>
        <Sheet.Close />
      </Sheet.Header>
      <FacebookBotFormContent form={form} />
    </>
  );
};

export const AutomationBotSheetForm = () => {
  const [facebookBotId, setFacebookBotId] =
    useQueryState<string>('facebookBotId');
  const [isOpen, setOpen] = useState(false);
  const isOpenSecondarySheet = useAtomValue(isOpenFacebookBotSecondarySheet);

  useEffect(() => {
    if (facebookBotId) {
      setOpen(true);
    }
  }, [facebookBotId]);

  return (
    <div>
      <Sheet
        open={isOpen}
        onOpenChange={(open) => {
          if (isOpen && !open) {
            setFacebookBotId(null);
          }
          setOpen(open);
        }}
      >
        <Sheet.Trigger asChild>
          <Button>
            <IconPlus />
            Add Bot
          </Button>
        </Sheet.Trigger>
        <Sheet.View
          className={cn('transition-all duration-300 ease-in-out', {
            'sm:max-w-lg h-[calc(100dvh-4rem)] inset-y-8': isOpenSecondarySheet,
          })}
        >
          {isOpen && <AutomationBotForm facebookBotId={facebookBotId} />}
        </Sheet.View>
      </Sheet>
    </div>
  );
};

const FacebookBotFormContent = ({
  form,
}: {
  form: UseFormReturn<TFacebookBotForm>;
}) => {
  const [isOptionalOpen, setOptionalOpen] = useState(false);
  const [isOpenAccountSheet, setOpenAccountSheet] = useAtom(
    isOpenFacebookBotSecondarySheet,
  );
  const { onSave, onSaveloading } = useFacebookBotSave();
  const [accountId, pageId] = form.watch(['accountId', 'pageId']);

  return (
    <>
      <Sheet.Content className="p-2">
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
        <Form {...form}>
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
                  <Form.Control>
                    <Input {...field} />
                  </Form.Control>
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
                  <Form.Control>
                    <FacebookMessageButtonsGenerator
                      addButtonText="+ Add persistent menu"
                      buttons={field.value}
                      setButtons={field.onChange}
                      limit={5}
                    />
                  </Form.Control>
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
                      <Form.Control>
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
                      </Form.Control>
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
                      <Form.Control>
                        <Input {...field} />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  control={form.control}
                  name="isEnabledBackBtn"
                  render={({ field }) => (
                    <Form.Item className="flex justify-between">
                      <Form.Label>
                        Enable Back Button on Persistence menu
                      </Form.Label>
                      <Form.Control>
                        <Switch
                          className="flex-none"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </Form.Control>
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
                      <Form.Control>
                        <Input
                          {...field}
                          disabled={!form.watch('isEnabledBackBtn')}
                        />
                      </Form.Control>
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

const FacebookPageInfo = memo(
  ({ accountId, pageId }: { accountId: string; pageId: string }) => {
    if (!accountId || !pageId) {
      return (
        <Label className="text-lg flex gap-2 items-center">
          <IconInfoTriangle className="size-3 text-destructive" /> Select a Page
        </Label>
      );
    }

    const { data, loading, error } = useQuery<{
      facebookGetPages: {
        id: string;
        name: string;
        isUsed: boolean;
      }[];
    }>(GET_FB_PAGES, {
      variables: {
        accountId,
        kind: IntegrationType.FACEBOOK_MESSENGER,
      },
    });

    const facebookGetPages = data?.facebookGetPages || [];

    const page = useMemo(
      () => facebookGetPages.find(({ id }) => pageId === id),
      [facebookGetPages, pageId],
    );

    if (!page) {
      return (
        <Label className="text-lg flex gap-2 items-center">
          <IconInfoTriangle className="size-3 text-destructive" /> Not found
        </Label>
      );
    }

    return (
      <Label className="text-lg flex gap-2 items-center">
        <IconCircleCheck className="size-3 text-success" />
        {page.name}
      </Label>
    );
  },
  (prevProps: any, nextProps: any) =>
    prevProps?.accountId === nextProps?.accountId &&
    prevProps?.pageId === nextProps?.pageId,
);
