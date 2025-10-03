import { Button, Collapsible, Label, Textarea } from 'erxes-ui';
import { EMLayout, EMLayoutPreviousStepButton } from './EMLayout';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { zodResolver } from '@hookform/resolvers/zod';
import { EMINTRO_SCHEMA } from '@/integrations/erxes-messenger/constants/emIntroSchema';
import { Form } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import {
  erxesMessengerSetupIntroAtom,
  erxesMessengerSetupStepAtom,
} from '@/integrations/erxes-messenger/states/erxesMessengerSetupStates';
import { EMFormValueEffectComponent } from '@/integrations/erxes-messenger/components/EMFormValueEffect';

export const EMIntro = () => {
  const form = useForm<z.infer<typeof EMINTRO_SCHEMA>>({
    resolver: zodResolver(EMINTRO_SCHEMA),
    defaultValues: {
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
        className="flex-auto flex flex-col"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <EMLayout
          title="Intro"
          actions={
            <>
              <EMLayoutPreviousStepButton />
              <Button type="submit">Next step</Button>
            </>
          }
        >
          <div className="p-4 pt-0">
            <Collapsible className="group/collapsible" defaultOpen>
              <Collapsible.TriggerButton>
                <Collapsible.TriggerIcon />
                <Label>Online messaging</Label>
              </Collapsible.TriggerButton>
              <Collapsible.Content className="p-4">
                <Form.Field
                  name="welcome"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Welcome message</Form.Label>
                      <Form.Control>
                        <Textarea
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Enter welcome message"
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
                <Label>Offline messaging</Label>
              </Collapsible.TriggerButton>
              <Collapsible.Content className="p-4 space-y-4">
                <Form.Field
                  name="away"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Away message</Form.Label>
                      <Form.Control>
                        <Textarea
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Enter away message"
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
                      <Form.Label>Thank you message</Form.Label>
                      <Form.Control>
                        <Textarea
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Enter thank you message"
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
