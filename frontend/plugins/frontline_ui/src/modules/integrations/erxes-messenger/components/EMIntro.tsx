import { useTranslation } from 'react-i18next';
import { Button, Collapsible, Label, Textarea, Form } from 'erxes-ui';
import { EMLayout, EMLayoutPreviousStepButton } from './EMLayout';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { zodResolver } from '@hookform/resolvers/zod';
import { EMINTRO_SCHEMA } from '@/integrations/erxes-messenger/constants/emIntroSchema';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  erxesMessengerSetupIntroAtom,
  erxesMessengerSetupStepAtom,
} from '@/integrations/erxes-messenger/states/erxesMessengerSetupStates';
import { EMFormValueEffectComponent } from '@/integrations/erxes-messenger/components/EMFormValueEffect';

export const EMIntro = () => {
  const { t } = useTranslation('frontline');
  const atomValue = useAtomValue(erxesMessengerSetupIntroAtom);
  const form = useForm<z.infer<typeof EMINTRO_SCHEMA>>({
    resolver: zodResolver(EMINTRO_SCHEMA),
    defaultValues: atomValue ?? {
      welcome: '',
      away: '',
      thank: '',
    },
  });

  const setStep = useSetAtom(erxesMessengerSetupStepAtom);

  const onSubmit = () => {
    setStep((prev) => prev + 1);
  };

  return (
    <Form {...form}>
      <EMFormValueEffectComponent
        form={form}
        atom={erxesMessengerSetupIntroAtom}
      />
      <form
        className="flex-auto h-full flex flex-col"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <EMLayout
          title={t('intro')}
          actions={
            <>
              <EMLayoutPreviousStepButton />
              <Button type="submit">{t('next-step')}</Button>
            </>
          }
        >
          <div className="p-4 pt-0 overflow-y-auto hide-scroll styled-scroll">
            <Collapsible className="group/collapsible" defaultOpen>
              <Collapsible.TriggerButton>
                <Collapsible.TriggerIcon />
                <Label>{t('online-messaging')}</Label>
              </Collapsible.TriggerButton>
              <Collapsible.Content className="p-4">
                <Form.Field
                  name="welcome"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>{t('welcome-message')}</Form.Label>
                      <Form.Control>
                        <Textarea
                          value={field.value}
                          onChange={field.onChange}
                          placeholder={t('enter-welcome-message')}
                        />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              </Collapsible.Content>
            </Collapsible>
            <Collapsible className="group/collapsible mt-4" defaultOpen>
              <Collapsible.TriggerButton>
                <Collapsible.TriggerIcon />
                <Label>{t('offline-messaging')}</Label>
              </Collapsible.TriggerButton>
              <Collapsible.Content className="p-4 space-y-4">
                <Form.Field
                  name="away"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>{t('away-message')}</Form.Label>
                      <Form.Control>
                        <Textarea
                          value={field.value}
                          onChange={field.onChange}
                          placeholder={t('enter-away-message')}
                        />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  name="thank"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>{t('thank-you-message')}</Form.Label>
                      <Form.Control>
                        <Textarea
                          value={field.value}
                          onChange={field.onChange}
                          placeholder={t('enter-thank-you-message')}
                        />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              </Collapsible.Content>
            </Collapsible>
          </div>
        </EMLayout>
      </form>
    </Form>
  );
};
