import { useSearchParams } from "react-router"
import { activeInstagramFormStepAtom, instagramFormSheetAtom, selectedInstagramAccountAtom } from "../states/instagramStates";
import { useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { InstagramIntegrationFormSheet } from "./InstagramIntegrationForm";
import { IIntegrationDetail } from "@/integrations/types/Integration";
import { Cell } from '@tanstack/table-core';
import {
    Button,
    Dialog,
    Separator,
    Sheet,
    Spinner,
    Form,
    Input,
    toast,
    Label,
  } from 'erxes-ui';
import { IconEdit } from "@tabler/icons-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useIntegrationDetail } from "@/integrations/instagram/hooks/useIntegrationDetail";
import { useIntegrationEdit } from "@/integrations/hooks/useIntegrationEdit";
import { INSTAGRAM_INTEGRATION_SCHEMA } from "../constants/IgMessengerSchema";
import { z } from "zod";


export const InstagramIntegrationDetail = ({ isPost } : { isPost?: boolean }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const setInstagramFormSheet = useSetAtom(instagramFormSheetAtom);
    const setSelectedAccount = useSetAtom(selectedInstagramAccountAtom);
    const setActiveStep = useSetAtom(activeInstagramFormStepAtom);

    useEffect(()=> {
        const igAuthorized = searchParams.get('igAuthorized');
        const accountId = searchParams.get('accountId');

        if( igAuthorized === 'true'){
            setInstagramFormSheet(true);

            // If accountId is provided, automatically select it and move to step 2
            if (accountId){
                setSelectedAccount(accountId);
                setActiveStep(2);
            }

            // Clean up the URL parameters
            searchParams.delete('igAuthorized');
            searchParams.delete('accountId');
            setSearchParams( searchParams, { replace: true });
        }

    }, [
        searchParams,
        setSearchParams,
        setInstagramFormSheet,
        setSelectedAccount,
        setActiveStep,
    ]);

    return (
        <div>
            <InstagramIntegrationFormSheet isPost={isPost} />
        </div>
    )
};

export const InstagramIntegrationActons = ({
    cell,
} : {
    cell : Cell<IIntegrationDetail, unknown>;
}) => {
    return <InstagramIntegrationEditSheet id={cell.row.original._id} />
};

export const InstagramIntegrationEditSheet = ({id} : { id:string }) => {
    const [open, setOpen] = useState(false);
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
                <Button>
                    <IconEdit />
                </Button>
            </Dialog.Trigger>
            <Dialog.Content className="p-6 gap-0 border-0 shadow-lg">
                <InstagramIntegrationEditForm id={id} setOpen={setOpen}/>
            </Dialog.Content>
        </Dialog>
    )
}


export const InstagramIntegrationEditForm = ({
    id,
    setOpen,
  }: {
    id: string;
    setOpen: (open: boolean) => void;
  }) => {
    const { loading, integrationDetail } = useIntegrationDetail({
      integrationId: id,
    });
  
    const { editIntegration, loading: editLoading } = useIntegrationEdit();
    const form = useForm<z.infer<typeof INSTAGRAM_INTEGRATION_SCHEMA>>({
      resolver: zodResolver(INSTAGRAM_INTEGRATION_SCHEMA),
    });
  
    useEffect(() => {
      if (integrationDetail) {
        form.reset({
          name: integrationDetail.name,
        });
      }
    }, [integrationDetail, form]);
  
    const onSubmit = (data: z.infer<typeof INSTAGRAM_INTEGRATION_SCHEMA>) => {
      editIntegration({
        variables: {
          _id: id,
          name: data.name,
          channelId: integrationDetail?.channelId || '',
        },
        onCompleted: () => {
          setOpen(false);
          toast({ title: 'Integration updated' });
        },
        onError: (error) => {
          toast({ title: error.message, variant: 'destructive' });
        },
      });
    };
  
    if (loading) return <Spinner className="p-20" />;
  
    return (
      <>
        <Dialog.Header className="flex-row items-center justify-between space-y-0 px-4 py-3">
          <Dialog.Title>{integrationDetail?.name}</Dialog.Title>
          <Sheet.Close />
        </Dialog.Header>
        <Separator />
  
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, (error) => {
              console.log(error);
            })}
          >
            <div className="p-6 pb-8 space-y-6">
              <div>
                <Label htmlFor="pageName">Page Name</Label>
                <Input
                  id="pageName"
                  value={integrationDetail?.instagramPage?.[0]?.name}
                  className="mt-2"
                  readOnly
                />
              </div>
              <Form.Field
                name="name"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Name</Form.Label>
                    <Form.Control>
                      <Input {...field} />
                    </Form.Control>
                  </Form.Item>
                )}
              />
            </div>
            <Separator />
            <Dialog.Footer className="flex justify-end py-4 px-6">
              <Dialog.Close asChild>
                <Button disabled={loading || editLoading} variant="ghost">
                  Close
                </Button>
              </Dialog.Close>
              <Button type="submit" disabled={loading || editLoading}>
                Save
              </Button>
            </Dialog.Footer>
          </form>
        </Form>
      </>
    );
  };