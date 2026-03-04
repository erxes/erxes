import { CellContext } from '@tanstack/react-table';
import { FacebookIntegrationFormSheet } from './FacebookIntegrationForm';
import { IIntegrationDetail } from '@/integrations/types/Integration';
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
import { IconEdit } from '@tabler/icons-react';
import { useIntegrationDetail } from '@/integrations/hooks/useIntegrationDetail';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useIntegrationEdit } from '@/integrations/hooks/useIntegrationEdit';
import { FACEBOOK_INTEGRATION_SCHEMA } from '@/integrations/facebook/constants/FbMessengerSchema';
import { useSearchParams } from 'react-router-dom';
import { useSetAtom } from 'jotai';
import {
  facebookFormSheetAtom,
  selectedFacebookAccountAtom,
  activeFacebookFormStepAtom,
} from '@/integrations/facebook/states/facebookStates';

export const FacebookIntegrationDetail = ({ isPost }: { isPost?: boolean }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const setFacebookFormSheet = useSetAtom(facebookFormSheetAtom);
  const setSelectedAccount = useSetAtom(selectedFacebookAccountAtom);
  const setActiveStep = useSetAtom(activeFacebookFormStepAtom);

  useEffect(() => {
    const fbAuthorized = searchParams.get('fbAuthorized');
    const accountId = searchParams.get('accountId');

    if (fbAuthorized === 'true') {
      setFacebookFormSheet(true);

      // If accountId is provided, automatically select it and move to step 2
      if (accountId) {
        setSelectedAccount(accountId);
        setActiveStep(2);
      }

      // Clean up the URL parameters
      searchParams.delete('fbAuthorized');
      searchParams.delete('accountId');
      setSearchParams(searchParams, { replace: true });
    }
  }, [
    searchParams,
    setSearchParams,
    setFacebookFormSheet,
    setSelectedAccount,
    setActiveStep,
  ]);

  return (
    <div>
      <FacebookIntegrationFormSheet isPost={isPost} />
    </div>
  );
};

export const FacebookIntegrationActions = ({
  cell,
}: {
  cell: CellContext<IIntegrationDetail, unknown>;
}) => {
  return <FacebookIntegrationEditSheet id={cell.row.original._id} />;
};

export const FacebookIntegrationEditSheet = ({ id }: { id: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <div className="flex items-center gap-2 w-full">
          <IconEdit size={16} />
          Edit
        </div>
      </Dialog.Trigger>
      <Dialog.Content className="p-0 gap-0 border-0 shadow-lg">
        <FacebookIntegrationEditForm id={id} setOpen={setOpen} />
      </Dialog.Content>
    </Dialog>
  );
};

export const FacebookIntegrationEditForm = ({
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
  const form = useForm<z.infer<typeof FACEBOOK_INTEGRATION_SCHEMA>>({
    resolver: zodResolver(FACEBOOK_INTEGRATION_SCHEMA),
  });

  useEffect(() => {
    if (integrationDetail) {
      form.reset({
        name: integrationDetail.name,
      });
    }
  }, [integrationDetail, form]);

  const onSubmit = (data: z.infer<typeof FACEBOOK_INTEGRATION_SCHEMA>) => {
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
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="p-6 pb-8 space-y-6">
            <div>
              <Label htmlFor="pageName">Page Name</Label>
              <Input
                id="pageName"
                value={integrationDetail?.facebookPage?.[0]?.name}
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
