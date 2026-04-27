import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, Label, Spinner, Switch } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CLIENTPORTAL_MANUAL_VERIFICATION_SCHEMA } from '../constants/clientPortalEditSchema';
import { SelectMember } from 'ui-modules';
import { IClientPortal } from '../types/clientPortal';
import { useUpdateClientPortal } from '../hooks/useUpdateClientPortal';

export function ClientPortalDetailManual({
  clientPortal,
}: {
  clientPortal: IClientPortal;
}) {
  const isActive = clientPortal.enableManualVerification ?? false;
  const form = useForm<z.infer<typeof CLIENTPORTAL_MANUAL_VERIFICATION_SCHEMA>>(
    {
      resolver: zodResolver(CLIENTPORTAL_MANUAL_VERIFICATION_SCHEMA),
      defaultValues: clientPortal.manualVerificationConfig,
    },
  );
  const { updateClientPortal, loading } = useUpdateClientPortal();

  function handleSubmit(
    data: z.infer<typeof CLIENTPORTAL_MANUAL_VERIFICATION_SCHEMA>,
  ) {
    updateClientPortal({
      variables: {
        id: clientPortal?._id,
        clientPortal: { manualVerificationConfig: data },
      },
    });
  }

  const handleEnableManualVerification = (value: boolean) => {
    updateClientPortal({
      variables: {
        id: clientPortal?._id,
        clientPortal: { enableManualVerification: value },
      },
    });
  };

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <Switch
          id="enableManualVerification"
          checked={isActive}
          onCheckedChange={handleEnableManualVerification}
          disabled={loading}
        />
        <Label variant="peer" htmlFor="enableManualVerification">
          Enable manual verification
        </Label>
      </div>
      {isActive && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="grid grid-cols-2 gap-4"
          >
            <Form.Field
              control={form.control}
              name="userIds"
              render={({ field }) => (
                <Form.Item className="col-span-2">
                  <Form.Label>Team Members</Form.Label>
                  <SelectMember.FormItem
                    mode="multiple"
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Select team members"
                  />
                  <Form.Description>
                    Select team members who can verify
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="verifyCustomer"
              render={({ field }) => (
                <Form.Item>
                  <div className="flex items-center gap-2">
                    <Form.Control>
                      <Switch
                        checked={!!field.value}
                        onCheckedChange={field.onChange}
                      />
                    </Form.Control>
                    <Form.Label variant="peer">Verify customer</Form.Label>
                  </div>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="verifyCompany"
              render={({ field }) => (
                <Form.Item>
                  <div className="flex items-center gap-2">
                    <Form.Control>
                      <Switch
                        checked={!!field.value}
                        onCheckedChange={field.onChange}
                      />
                    </Form.Control>
                    <Form.Label variant="peer">Verify company</Form.Label>
                  </div>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Button
              type="submit"
              className="mt-2 col-span-2"
              disabled={loading}
              variant="secondary"
            >
              {loading && <Spinner containerClassName="w-auto flex-none" />}
              Save
            </Button>
          </form>
        </Form>
      )}
    </>
  );
}
