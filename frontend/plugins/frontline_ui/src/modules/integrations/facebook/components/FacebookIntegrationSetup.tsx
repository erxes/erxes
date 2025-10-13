import { Button, Form, Input } from 'erxes-ui';
import {
  FacebookIntegrationFormSteps,
  FacebookIntegrationFormLayout,
} from './FacebookIntegrationForm';
import { useSetAtom } from 'jotai';
import {
  activeFacebookFormStepAtom,
  resetFacebookAddStateAtom,
  selectedFacebookPageAtom,
} from '../states/facebookStates';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { FACEBOOK_INTEGRATION_SCHEMA } from '../constants/FbMessengerSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { SelectBrand } from 'ui-modules';
import { SelectChannel } from '@/inbox/channel/components/SelectChannel';
import { useIntegrationAdd } from '@/integrations/hooks/useIntegrationAdd';
import { useAtomValue } from 'jotai';
import { selectedFacebookAccountAtom } from '../states/facebookStates';
import { IntegrationType } from '@/types/Integration';
import { useFbIntegrationContext } from '@/integrations/facebook/contexts/FbIntegrationContext';

export const FacebookIntegrationSetup = () => {
  const { isPost } = useFbIntegrationContext();
  const form = useForm<z.infer<typeof FACEBOOK_INTEGRATION_SCHEMA>>({
    resolver: zodResolver(FACEBOOK_INTEGRATION_SCHEMA),
    defaultValues: {
      name: '',
      brandId: '',
      channelId: '',
    },
  });

  const accountId = useAtomValue(selectedFacebookAccountAtom);
  const pageId = useAtomValue(selectedFacebookPageAtom);

  const { addIntegration, loading } = useIntegrationAdd();

  const resetFacebookForm = useSetAtom(resetFacebookAddStateAtom);
  const setActiveStep = useSetAtom(activeFacebookFormStepAtom);

  const onNext = (data: z.infer<typeof FACEBOOK_INTEGRATION_SCHEMA>) => {
    addIntegration({
      variables: {
        kind: isPost
          ? IntegrationType.FACEBOOK_POST
          : IntegrationType.FACEBOOK_MESSENGER,
        name: data.name,
        brandId: data.brandId,
        accountId,
        channelId: data.channelId,
        data: {
          pageIds: [pageId],
        },
      },
      refetchQueries: ['integrations'],
    });
    resetFacebookForm();
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col flex-1"
        onSubmit={form.handleSubmit(onNext)}
      >
        <FacebookIntegrationFormLayout
          actions={
            <>
              <Button
                variant="secondary"
                className="bg-border"
                onClick={() => setActiveStep(2)}
              >
                Previous step
              </Button>
              <Button type="submit" disabled={loading}>
                Save
              </Button>
            </>
          }
        >
          <FacebookIntegrationFormSteps
            title="Integration Setup"
            step={3}
            description=""
          />
          <div className="flex-1 overflow-hidden p-4 pt-0 flex flex-col gap-4">
            <Form.Field
              name="name"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Integration name</Form.Label>
                  <Form.Control>
                    <Input {...field} />
                  </Form.Control>
                  <Form.Description>
                    Name this integration to differentiate from the rest
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              name="brandId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Brand</Form.Label>
                  <Form.Control>
                    <SelectBrand
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                  </Form.Control>
                  <Form.Description>
                    Which specific Brand does this integration belong to?
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              name="channelId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Channel</Form.Label>
                  <SelectChannel.FormItem
                    className="flex w-full"
                    value={field.value || []}
                    onValueChange={field.onChange}
                  />
                  <Form.Description>
                    Which specific Channel does this integration belong to?
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </div>
        </FacebookIntegrationFormLayout>
      </form>
    </Form>
  );
};
