import { ApolloError } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, ScrollArea, Sheet, useQueryState, useToast } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { CompanyAddGeneralInformationFields } from './CompanyAddGeneralInformationFields';
import { CompanyAddSheetHeader } from './CompanyAddSheet';
import {
  companyFormSchema,
  CompanyFormType,
} from '../constants/formSchema';
import { useAddCompany } from '../hooks/useAddCompany';

export function AddCompanyForm({
  onOpenChange,
}: {
  onOpenChange?: (open: boolean) => void;
}) {
  const { companiesAdd } = useAddCompany();
  const form = useForm<CompanyFormType>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      primaryName: '',
      email: '',
      phone: '',
      website: '',
      industry: [],
      description: '',
      code: '',
      avatar: '',
      location: '',
      parentCompanyId: '',
    },
  });
  const { toast } = useToast();
  const [, setCompanyId] = useQueryState('companyId');

  const { t } = useTranslation('contact');

  const onSubmit = (data: CompanyFormType) => {
    const { phone, industry, ...rest } = data;
    companiesAdd({
      variables: {
        ...rest,
        primaryPhone: phone,
        industry: industry?.map((i) => i.value),
      },
      onError: (e: ApolloError) => {
        toast({
          title: 'Error',
          description: e.message,
          variant: 'destructive',
        });
      },
      onCompleted: (res) => {
        form.reset();
        onOpenChange?.(false);
        if (res?.companiesAdd?._id) {
          setCompanyId(res.companiesAdd._id);
        }
        toast({
          title: t('success'),
          variant: 'success',
          description: t('company.add.success-message') || 'Company successfully created',
        });
      },
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col h-full"
      >
        <CompanyAddSheetHeader />
        <Sheet.Content className="flex-1 min-h-0 flex flex-col">
          <AddCompanyFormTabs>
            <CompanyAddGeneralInformationFields form={form} />
          </AddCompanyFormTabs>
        </Sheet.Content>
        <Sheet.Footer className="flex justify-end shrink-0 gap-1 px-5">
          <Button
            type="button"
            variant="ghost"
            className="bg-background hover:bg-background/90"
            onClick={() => onOpenChange?.(false)}
          >
            {t('cancel')}
          </Button>
          <Button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {t('save')}
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
}

const AddCompanyFormTabs = ({ children }: { children: React.ReactNode }) => {
  return (
    <ScrollArea className="flex-auto">
      <div className="p-5">{children}</div>
    </ScrollArea>
  );
};
