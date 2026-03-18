import { Button, Form, Input } from 'erxes-ui';
import { SelectBrand } from 'ui-modules';
import {
  FacebookIntegrationFormSteps,
  FacebookIntegrationFormLayout,
} from './FacebookIntegrationForm';
import { useSetAtom, useAtomValue } from 'jotai';
import {
  activeFacebookFormStepAtom,
  resetFacebookAddStateAtom,
  selectedFacebookPageAtom,
  selectedFacebookAccountAtom,
} from '../states/facebookStates';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { FACEBOOK_INTEGRATION_SCHEMA } from '@/integrations/facebook/constants/FbMessengerSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useIntegrationAdd } from '@/integrations/hooks/useIntegrationAdd';
import { IntegrationType } from '@/types/Integration';
import { useFbIntegrationContext } from '@/integrations/facebook/contexts/FbIntegrationContext';
import { useParams } from 'react-router';

export const FacebookIntegrationSetup = () => {
  const { id: channelId } = useParams();
  const { isPost } = useFbIntegrationContext();
  const form = useForm<z.infer<typeof FACEBOOK_INTEGRATION_SCHEMA>>({
    resolver: zodResolver(FACEBOOK_INTEGRATION_SCHEMA),
    defaultValues: {
      name: '',
      brandId: '',
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
        accountId,
        channelId: channelId as string,
        brandId: data.brandId,
        data: {
          pageIds: [pageId],
        },
      },
      refetchQueries: ['Integrations'],
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
                      placeholder="Select a brand"
                      className="w-full h-10 rounded-lg border bg-background"
                    />
                  </Form.Control>
                  <Form.Description>
                    Choose the brand for this integration
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
