import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

import { Button, Form, ScrollArea, Sheet, useToast } from 'erxes-ui';

import { CustomerAddGeneralInformationFields } from '@/contacts/customers/components/CustomerAddGeneralInformationFields';
import { CustomerAddSheetHeader } from '@/contacts/customers/components/CustomerAddSheet';
import {
  customerFormSchema,
  CustomerFormType,
} from '@/contacts/customers/constants/formSchema';
import { useAddCustomer } from '@/contacts/customers/hooks/useAddCustomer';
import { ContactsPath } from '@/types/paths/ContactsPath';
import { ApolloError } from '@apollo/client';
import { useLocation } from 'react-router-dom';
import { useQueryState } from 'erxes-ui';

export function AddCustomerForm({
  onOpenChange,
}: {
  onOpenChange?: (open: boolean) => void;
}) {
  const { pathname } = useLocation();

  const { customersAdd } = useAddCustomer();
  const form = useForm<CustomerFormType>({
    resolver: zodResolver(customerFormSchema),
  });
  const { toast } = useToast();
  const [, setCustomerId] = useQueryState('contactId');

  const onSubmit = (data: CustomerFormType) => {
    const state = pathname.includes(ContactsPath.Leads) ? 'lead' : 'customer';

    customersAdd({
      variables: {
        ...data,
        state,
      },
      onError: (e: ApolloError) => {
        toast({
          title: 'Error',
          description: e.message,
        });
      },
      onCompleted: (data) => {
        form.reset();
        onOpenChange?.(false);
        setCustomerId(data?.customersAdd._id);
      },
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col h-full"
      >
        <CustomerAddSheetHeader />
        <Sheet.Content>
          <AddCustomerFormTabs>
            <CustomerAddGeneralInformationFields form={form} />
          </AddCustomerFormTabs>
        </Sheet.Content>
        <Sheet.Footer className="flex justify-end flex-shrink-0 gap-1 px-5">
          <Button
            type="button"
            variant="ghost"
            className="bg-background hover:bg-background/90"
            onClick={() => onOpenChange?.(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Save
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
}

const AddCustomerFormTabs = ({ children }: { children: React.ReactNode }) => {
  return (
    <ScrollArea className="flex-auto">
      <div className="p-5">{children}</div>
    </ScrollArea>
  );
};
