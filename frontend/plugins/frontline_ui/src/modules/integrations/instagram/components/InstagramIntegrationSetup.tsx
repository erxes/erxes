import { Button, Form, Input } from 'erxes-ui';
import {
  InstagramIntegrationFormSteps,
  InstagramIntegrationFormLayout,
} from './InstagramIntegrationForm';
import { useSetAtom } from 'jotai';
import {
  activeInstagramFormStepAtom,
  resetInstagramAddStateAtom,
  selectedInstagramPageAtom,
} from '../states/instagramStates';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { INSTAGRAM_INTEGRATION_SCHEMA } from '../constants/IgMessengerSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useIntegrationAdd } from '@/integrations/hooks/useIntegrationAdd';
import { useAtomValue } from 'jotai';
import { selectedInstagramAccountAtom } from '../states/instagramStates';
import { useIgIntegrationContext } from '../context/IgIntegrationContext';
import { useParams } from 'react-router';

const INTEGRATION_KINDS = {
  POST: 'instagram-post',
  MESSENGER: 'instagram',
};

export const InstagramIntegrationSetup = () => {
  const { id: channelId } = useParams();
  const { isPost } = useIgIntegrationContext();
  const form = useForm<z.infer<typeof INSTAGRAM_INTEGRATION_SCHEMA>>({
    resolver: zodResolver(INSTAGRAM_INTEGRATION_SCHEMA),
    defaultValues: { name: '' },
  });

  const accountId = useAtomValue(selectedInstagramAccountAtom);
  const pageId = useAtomValue(selectedInstagramPageAtom);

  const { addIntegration, loading } = useIntegrationAdd();
  const resetInstagramForm = useSetAtom(resetInstagramAddStateAtom);
  const setActiveStep = useSetAtom(activeInstagramFormStepAtom);

  const onNext = (data: z.infer<typeof INSTAGRAM_INTEGRATION_SCHEMA>) => {
    addIntegration({
      variables: {
        kind: isPost ? INTEGRATION_KINDS.POST : INTEGRATION_KINDS.MESSENGER,
        name: data.name,
        accountId,
        channelId: channelId as string,
        data: { pageIds: [pageId] },
      },
      refetchQueries: ['Integrations'],
    });
    resetInstagramForm();
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col flex-1"
        onSubmit={form.handleSubmit(onNext)}
      >
        <InstagramIntegrationFormLayout
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
          <InstagramIntegrationFormSteps
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
          </div>
        </InstagramIntegrationFormLayout>
      </form>
    </Form>
  );
};
