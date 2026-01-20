import { useParams } from "react-router"
import { useIgIntegrationContext } from "../context/IgIntegrationContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { INSTAGRAM_INTEGRATION_SCHEMA } from "../constants/IgMessengerSchema";
import { useAtomValue, useSetAtom } from "jotai";
import { activeInstagramFormStepAtom, resetInstagramAddStateAtom, selectedInstagramAccountAtom, selectedInstagramPageAtom } from "../states/instagramStates";
import { IntegrationType } from "@/types/Integration";
import { useIntegrationAdd } from "@/integrations/hooks/useIntegrationAdd";
import { z } from 'zod';
import { Button, Form, Input } from 'erxes-ui';
import { InstagramIntegrationFormLayout, InstagramIntegrationFormSteps } from "./InstagramIntegrationForm";


export const InstagramIntegrationSetup = () => {
    const { id: channelId} = useParams();
    const { isPost } = useIgIntegrationContext();
    const form = useForm<z.infer<typeof INSTAGRAM_INTEGRATION_SCHEMA>>({
        resolver: zodResolver (INSTAGRAM_INTEGRATION_SCHEMA),
        defaultValues : {
            name:'',
        },
    });

    const accountId = useAtomValue(selectedInstagramAccountAtom);
    const pageId = useAtomValue(selectedInstagramPageAtom);

    const { addIntegration, loading } = useIntegrationAdd();

    const resetInstagramForm = useSetAtom(resetInstagramAddStateAtom);
    const setActiveStep = useSetAtom(activeInstagramFormStepAtom);
  

    const onNext = (data: z.infer<typeof INSTAGRAM_INTEGRATION_SCHEMA>) => {
        addIntegration({
          variables: {
            kind: isPost
              ? IntegrationType.INSTAGRAM_POST
              : IntegrationType.INSTAGRAM_MESSENGER,
            name: data.name,
            accountId,
            channelId: channelId as string,
            data: {
              pageIds: [pageId],
            },
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

}