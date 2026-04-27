import { useEffect, useState } from 'react';
import { Button, Form, useToast } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { SelectBranches, SelectDepartments } from 'ui-modules';
import { IPricingPlanDetail } from '@/pricing/types';
import { useEditPricing } from '@/pricing/hooks/useEditPricing';

interface LocationProps {
  pricingId?: string;
  pricingDetail?: IPricingPlanDetail;
}

export const Location = ({ pricingId, pricingDetail }: LocationProps) => {
  const { editPricing, loading } = useEditPricing();
  const { toast } = useToast();

  const [hasChanges, setHasChanges] = useState(false);

  const form = useForm<{ departmentIds: string[]; branchIds: string[] }>({
    defaultValues: {
      departmentIds: [],
      branchIds: [],
    },
  });

  useEffect(() => {
    const subscription = form.watch(() => {
      setHasChanges(true);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  useEffect(() => {
    if (pricingDetail) {
      form.reset({
        departmentIds: pricingDetail.departmentIds || [],
        branchIds: pricingDetail.branchIds || [],
      });
      setHasChanges(false);
    }
  }, [pricingDetail, form]);

  const handleSave = async () => {
    if (!pricingId) return;

    const values = form.getValues();

    try {
      await editPricing({
        _id: pricingId,
        departmentIds: values.departmentIds,
        branchIds: values.branchIds,
      });
      toast({
        title: 'Location updated',
        description: 'Changes have been saved successfully.',
      });
    } catch {
      toast({
        title: 'Failed to update location',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSave)}
        className="space-y-6"
        noValidate
      >
        <div className="space-y-4">
          <Form.Field
            control={form.control}
            name="departmentIds"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>DEPARTMENTS</Form.Label>
                <Form.Control>
                  <SelectDepartments.FormItem
                    mode="multiple"
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                </Form.Control>
              </Form.Item>
            )}
          />

          <Form.Field
            control={form.control}
            name="branchIds"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>BRANCHES</Form.Label>
                <Form.Control>
                  <SelectBranches.FormItem
                    mode="multiple"
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                </Form.Control>
              </Form.Item>
            )}
          />
        </div>

        {hasChanges && (
          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" disabled={loading}>
              Save Changes
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
};
