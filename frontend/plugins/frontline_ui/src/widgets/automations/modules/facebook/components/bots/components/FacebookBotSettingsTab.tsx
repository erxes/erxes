import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { Button, Collapsible, Form, Input, Label, Select } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FacebookIceBreakerGenerator } from '~/widgets/automations/modules/facebook/components/bots/components/FacebookIceBreakerGenerator';
import { FacebookPersistentMenuGenerator } from '~/widgets/automations/modules/facebook/components/bots/components/FacebookPersistentMenuGenerator';
import {
  FACEBOOK_GET_STARTED_TITLE,
  FACEBOOK_ICE_BREAKER_LIMIT,
  FACEBOOK_PERSISTENT_MENU_USER_LIMIT,
} from '~/widgets/automations/modules/facebook/components/bots/utils/buildMessengerProfilePreview';
import { useFbBotFormContext } from '../context/FbBotFormContext';

export const FacebookBotSettingsTab = () => {
  const { t } = useTranslation('frontline');
  const { form } = useFbBotFormContext();
  const [isOptionalOpen, setOptionalOpen] = useState(false);
  const persistentMenus = form.watch('persistentMenus');
  const hasHumanHandoffMenu = persistentMenus?.some(
    (menu) => menu.type === 'human_handoff',
  );

  return (
    <>
      <Form.Field
        control={form.control}
        name="persistentMenus"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('persistent-menu')}</Form.Label>
            <Form.Description>
              {t('persistent-menu-description')}
            </Form.Description>
            <FacebookPersistentMenuGenerator
              menus={field.value}
              setMenus={field.onChange}
              limit={FACEBOOK_PERSISTENT_MENU_USER_LIMIT}
            />
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name="iceBreakers"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>
              {t('ice-breakers', { defaultValue: 'Ice breakers' })}
            </Form.Label>
            <Form.Description>
              {t('ice-breakers-description', {
                defaultValue:
                  'Questions Messenger shows under “Tap to send” before the first message.',
              })}
            </Form.Description>
            <FacebookIceBreakerGenerator
              iceBreakers={field.value || []}
              setIceBreakers={field.onChange}
              limit={FACEBOOK_ICE_BREAKER_LIMIT}
            />
            <Form.Message />
          </Form.Item>
        )}
      />

      <Collapsible open={isOptionalOpen} onOpenChange={setOptionalOpen}>
        <Collapsible.Trigger asChild>
          <Button variant="secondary" className="w-full">
            <Label className="flex items-center gap-2">
              {isOptionalOpen ? t('hide') : t('show')}{' '}
              {t('optional-configuration')}{' '}
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
                <Select value={field.value} onValueChange={field.onChange}>
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
                <span className="text-accent-foreground">
                  Message tags may not be used to send promotional content,
                  including but not limited to deals,purchases offers, coupons,
                  and discounts. Use of tags outside of the approved use cases
                  may result in restrictions on the Page's ability to send
                  messages.
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
            name="getStartedText"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>
                  {t('get-started-label', {
                    defaultValue: 'Get Started label',
                  })}
                </Form.Label>
                <Form.Description>
                  {t('get-started-label-description', {
                    defaultValue:
                      'Rename the button visitors see. Automations keep matching it, because the match is on its payload.',
                  })}
                </Form.Description>
                <Input {...field} placeholder={FACEBOOK_GET_STARTED_TITLE} />
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
          {hasHumanHandoffMenu && (
            <>
              <Form.Field
                control={form.control}
                name="handoffPauseMinutes"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('inactivity-pause-minutes')}</Form.Label>
                    <Input
                      type="number"
                      min={1}
                      value={field.value || 10}
                      onChange={(event) =>
                        field.onChange(event.currentTarget.value)
                      }
                    />
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="handoffMessage"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('human-handoff-message')}</Form.Label>
                    <Input {...field} />
                    <Form.Message />
                  </Form.Item>
                )}
              />
              <Form.Field
                control={form.control}
                name="automationActiveMessage"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>{t('automation-active-message')}</Form.Label>
                    <Input {...field} />
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </>
          )}
        </Collapsible.Content>
      </Collapsible>
    </>
  );
};
