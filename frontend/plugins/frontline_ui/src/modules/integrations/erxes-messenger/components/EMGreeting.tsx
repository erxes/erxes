import {
  EMLayout,
  EMLayoutPreviousStepButton,
} from '@/integrations/erxes-messenger/components/EMLayout';
import { Button, Input, Form, Avatar } from 'erxes-ui';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { EMGREETING_SCHEMA } from '@/integrations/erxes-messenger/constants/emGreetingSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { SelectMember } from 'ui-modules';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useSetAtom } from 'jotai';
import {
  erxesMessengerSetupGreetingAtom,
  erxesMessengerSetupStepAtom,
} from '@/integrations/erxes-messenger/states/erxesMessengerSetupStates';
import { EMFormValueEffectComponent } from '@/integrations/erxes-messenger/components/EMFormValueEffect';

export const EMGreeting = () => {
  const form = useForm<z.infer<typeof EMGREETING_SCHEMA>>({
    resolver: zodResolver(EMGREETING_SCHEMA),
    defaultValues: {
      title: '',
      message: '',
    },
  });
  const setStep = useSetAtom(erxesMessengerSetupStepAtom);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'links',
  });

  const onSubmit = () => {
    setStep((prev) => prev + 1);
  };

  return (
    <Form {...form}>
      <EMFormValueEffectComponent
        form={form}
        atom={erxesMessengerSetupGreetingAtom}
      />
      <form
        className="flex-auto flex flex-col"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <EMLayout
          title="Greeting"
          actions={
            <>
              <EMLayoutPreviousStepButton />
              <Button type="submit">Next step</Button>
            </>
          }
        >
          <div className="space-y-6 p-4 pt-0">
            <Form.Field
              name="title"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Greeting Title</Form.Label>
                  <Form.Control>
                    <Input {...field} />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              name="message"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Greeting Message</Form.Label>
                  <Form.Control>
                    <Input {...field} />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              name="supporterIds"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Supporters</Form.Label>
                  <SelectMember.FormItem
                    placeholder="Select supporters"
                    value={field.value}
                    mode="multiple"
                    onValueChange={field.onChange}
                  />
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Item>
              <Form.Label>Social Links</Form.Label>
              {fields.map((field, index) => {
                return (
                  <div className="flex gap-2 items-center" key={field.id}>
                    <Form.Field
                      key={field.id}
                      name={`links.${index}.url`}
                      render={({ field }) => (
                        <>
                          <EMGreetingAvatar url={field.value} />
                          <Form.Item className="flex-auto">
                            <Form.Control>
                              <Input {...field} />
                            </Form.Control>
                            <Form.Message />
                          </Form.Item>
                        </>
                      )}
                    />
                    <Button
                      variant="secondary"
                      onClick={() => {
                        remove(index);
                      }}
                      className="size-8 hover:bg-destructive/30 bg-destructive/10 text-destructive"
                    >
                      <IconTrash />
                    </Button>
                  </div>
                );
              })}
              <div>
                <Button
                  onClick={() => {
                    append({ url: '' });
                  }}
                  variant="secondary"
                >
                  <IconPlus />
                  Add social link
                </Button>
              </div>
            </Form.Item>
          </div>
        </EMLayout>
      </form>
    </Form>
  );
};

export const EMGreetingAvatar = ({ url }: { url: string }) => {
  const getGoogleFavicon = (url: string) =>
    `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${url}&size=128`;

  return (
    <Avatar size="lg" className="rounded">
      {z.string().url().safeParse(url).success && (
        <Avatar.Image src={getGoogleFavicon(url)} />
      )}
      <Avatar.Fallback></Avatar.Fallback>
    </Avatar>
  );
};
