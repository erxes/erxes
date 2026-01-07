import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, ScrollArea, Sheet, Form, useToast } from 'erxes-ui';
import { ApolloError } from '@apollo/client';
import {
  loyaltyScoreFormSchema,
  LoyaltyScoreFormValues,
} from '../../constants/formSchema';
import { LoyaltyScoreAddCoreFields } from './LoyaltyScoreAddCoreFields';
import { LoyaltyScoreAddMoreFields } from './LoyaltyScoreAddMoreFields';
import {
  useAddLoyaltyScore,
  AddLoyaltyScoreVariables,
} from '../hooks/useAddLoyaltyScore';

export function AddLoyaltyScoreForm({
  onOpenChange,
}: {
  onOpenChange: (open: boolean) => void;
}) {
  const { loyaltyScoreAdd, loading: editLoading } = useAddLoyaltyScore();
  const form = useForm<LoyaltyScoreFormValues>({
    resolver: zodResolver(loyaltyScoreFormSchema),
    defaultValues: {
      title: '',
      description: '',
      productCategory: [],
      product: [],
      tags: [],
      orExcludeProductCategory: [],
      orExcludeProduct: [],
      orExcludeTag: [],
    },
  });
  const { toast } = useToast();
  async function onSubmit(data: LoyaltyScoreFormValues) {
    const variables: AddLoyaltyScoreVariables = {
      title: data.title,
    };

    Object.entries(data).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== '' &&
        (!Array.isArray(value) || value.length > 0)
      ) {
        (variables as any)[key] = value;
      }
    });

    loyaltyScoreAdd({
      variables,
      onError: (e: ApolloError) => {
        toast({
          title: 'Error',
          description: e.message,
          variant: 'destructive',
        });
      },
      onCompleted: () => {
        form.reset();
        onOpenChange(false);
      },
    });
  }

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col h-full overflow-hidden"
      >
        <Sheet.Content className="flex-auto overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-5">
              <LoyaltyScoreAddCoreFields form={form} />
              <LoyaltyScoreAddMoreFields form={form} />
            </div>
          </ScrollArea>
        </Sheet.Content>

        <Sheet.Footer className="flex justify-end shrink-0 p-2.5 gap-1 bg-muted">
          <Button
            type="button"
            variant="ghost"
            className="bg-background hover:bg-background/90"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={editLoading}
          >
            {editLoading ? 'Saving...' : 'Save'}
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
}
