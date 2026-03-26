import { ApolloError, useMutation } from '@apollo/client';
import {
  Button,
  Form,
  ScrollArea,
  Sheet,
  useToast,
  useQueryState,
} from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
import { LoyaltyScoreFormValues } from '../../constants/formSchema';
import { LoyaltyScoreAddCoreFields } from '../../add-score-campaign/components/LoyaltyScoreAddCoreFields';
import { LoyaltyScoreAddMoreFields } from '../../add-score-campaign/components/LoyaltyScoreAddMoreFields';
import { UPDATE_SCORE_CAMPAIGN } from '../../graphql/mutations/editLoyaltyScoreMutation';
import { useScoreDetailWithQuery } from '../hooks/useScoreDetailWithQuery';

type Props = {
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<LoyaltyScoreFormValues>;
};

export const EditScoreForm = ({ onOpenChange, form }: Props) => {
  const { scoreDetail } = useScoreDetailWithQuery();
  const [, setEditScoreId] = useQueryState('editScoreId');
  const { toast } = useToast();

  const [updateScore, { loading }] = useMutation(UPDATE_SCORE_CAMPAIGN, {
    refetchQueries: ['GetScoreCampaigns'],
  });

  const handleSubmit = form.handleSubmit(
    (data) => {
      if (!scoreDetail?._id) {
        toast({
          title: 'Error',
          description: 'Score campaign ID not found',
          variant: 'destructive',
        });
        return;
      }

      const restrictions = {
        productCategoryIds: (data.conditions.productCategoryIds || []).join(
          ',',
        ),
        excludeProductCategoryIds: (
          data.conditions.excludeProductCategoryIds || []
        ).join(','),
        productIds: (data.conditions.productIds || []).join(','),
        excludeProductIds: (data.conditions.excludeProductIds || []).join(','),
        tagIds: (data.conditions.tagIds || []).join(','),
        excludeTagIds: (data.conditions.excludeTagIds || []).join(','),
      };

      updateScore({
        variables: {
          _id: scoreDetail._id,
          title: data.title,
          description: data.description || '',
          serviceName: data.conditions.serviceName,
          restrictions,
          add: data.add,
          subtract: data.subtract,
          ownerType: data.ownerType,
          onlyClientPortal: data.onlyClientPortal,
          fieldGroupId: data.fieldGroupId,
          fieldOrigin: data.fieldOrigin,
          fieldName: data.fieldName || '',
          fieldId: data.fieldId || '',
        },
        onCompleted: () => {
          toast({
            title: 'Success',
            description: 'Score campaign updated successfully',
            variant: 'default',
          });
          setEditScoreId(null);
          onOpenChange(false);
        },
        onError: (e: ApolloError) => {
          toast({
            title: 'Error',
            description: e.message,
            variant: 'destructive',
          });
        },
      });
    },
    () => {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
    },
  );

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit}
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
            onClick={() => {
              setEditScoreId(null);
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update'}
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
};
