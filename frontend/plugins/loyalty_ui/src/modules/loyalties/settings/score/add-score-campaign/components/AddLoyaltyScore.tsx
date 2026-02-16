import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, ScrollArea, Sheet, Form } from 'erxes-ui';
import {
  loyaltyScoreFormSchema,
  LoyaltyScoreFormValues,
} from '../../constants/formSchema';
import { LoyaltyScoreAddCoreFields } from './LoyaltyScoreAddCoreFields';
import { LoyaltyScoreAddMoreFields } from './LoyaltyScoreAddMoreFields';
import { AddScoreVariables, useAddScore } from '../hooks/useAddLoyaltyScore';

export function AddLoyaltyScoreForm({
  onOpenChange,
}: Readonly<{
  onOpenChange: (open: boolean) => void;
}>) {
  const { scoreAdd, loading: editLoading } = useAddScore();
  const form = useForm<LoyaltyScoreFormValues>({
    resolver: zodResolver(loyaltyScoreFormSchema),
    defaultValues: {
      title: '',
      description: '',
      conditions: {
        serviceName: '',
        productCategoryIds: [],
        productIds: [],
        tagIds: [],
        excludeProductCategoryIds: [],
        excludeProductIds: [],
        excludeTagIds: [],
      },
    },
  });

  async function onSubmit(data: LoyaltyScoreFormValues) {
    const variables: AddScoreVariables = {
      name: data.title,
      serviceName: data.conditions.serviceName,
      restrictions: {
        productCategoryIds: data.conditions.productCategoryIds?.join(','),
        productIds: data.conditions.productIds?.join(','),
        tagIds: data.conditions.tagIds?.join(','),
        excludeProductCategoryIds:
          data.conditions.excludeProductCategoryIds?.join(','),
        excludeProductIds: data.conditions.excludeProductIds?.join(','),
        excludeTagIds: data.conditions.excludeTagIds?.join(','),
      },
    };

    scoreAdd({
      variables,
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
