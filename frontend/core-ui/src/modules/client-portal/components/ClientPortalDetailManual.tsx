import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, Input, Label, Switch } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useState } from 'react';
import { CLIENTPORTAL_MANUAL_VERIFICATION_SCHEMA } from '../constants/clientPortalEditSchema';
import { SelectMember } from 'ui-modules';

export function ClientPortalDetailManual() {
  const [isActive, setIsActive] = useState<boolean>(false);
  const form = useForm<z.infer<typeof CLIENTPORTAL_MANUAL_VERIFICATION_SCHEMA>>(
    {
      resolver: zodResolver(CLIENTPORTAL_MANUAL_VERIFICATION_SCHEMA),
      defaultValues: {
        userIds: [],
        verifyCustomer: false,
        verifyCompany: false,
      },
    },
  );

  function handleSubmit(
    data: z.infer<typeof CLIENTPORTAL_MANUAL_VERIFICATION_SCHEMA>,
  ) {
    // handle save here
  }

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <Switch
          id="enableManualVerification"
          checked={isActive}
          onCheckedChange={setIsActive}
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
                    <Switch
                      id="verifyCustomer"
                      checked={!!field.value}
                      onCheckedChange={field.onChange}
                    />
                    <Form.Label htmlFor="verifyCustomer">
                      Verify Customer
                    </Form.Label>
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
                    <Switch
                      id="verifyCompany"
                      checked={!!field.value}
                      onCheckedChange={field.onChange}
                    />
                    <Form.Label htmlFor="verifyCompany">
                      Verify Company
                    </Form.Label>
                  </div>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Button type="submit" className="mt-2 col-span-2">
              Save
            </Button>
          </form>
        </Form>
      )}
    </>
  );
}
