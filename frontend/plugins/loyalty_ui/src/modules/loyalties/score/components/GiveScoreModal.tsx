import { Button, Sheet, Form, Input, useToast, Tabs } from 'erxes-ui';
import { IconPlus, IconBriefcase, IconShoppingCart } from '@tabler/icons-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@apollo/client';
import { CHANGE_SCORE_MUTATION } from '../graphql/mutations';
import { SelectOwnerTypeFormItem } from './selects/SelectOwnerType';
import { SelectScoreCampaignFormItem } from './selects/SelectScoreCampaign';
import { SelectScoreCustomerFormItem } from './selects/SelectCustomer';
import {
  SelectCompanyFormItem,
  SelectUserFormItem,
  SelectClientPortalUserFormItem,
} from './selects/SelectOwnerById';
import { ChooseDealSheet } from './ChooseDealSheet';

type TargetType = 'sales' | 'pos' | null;

interface GiveScoreFormValues {
  ownerType: string;
  ownerId: string;
  campaignId: string;
  change: number;
  description: string;
  targetId: string;
  serviceName: string;
}

interface GiveScoreModalProps {
  triggerLabel?: string;
  refetchQueries?: string[];
}

export const GiveScoreModal = ({
  triggerLabel = 'Give Score',
  refetchQueries = ['ScoreLogList'],
}: GiveScoreModalProps) => {
  const [open, setOpen] = useState(false);
  const [targetType, setTargetType] = useState<TargetType>(null);
  const [dealSheetOpen, setDealSheetOpen] = useState(false);
  const [selectedDealName, setSelectedDealName] = useState('');
  const { toast } = useToast();

  const [changeScore, { loading }] = useMutation(CHANGE_SCORE_MUTATION, {
    refetchQueries,
  });

  const form = useForm<GiveScoreFormValues>({
    defaultValues: {
      ownerType: 'customer',
      ownerId: '',
      campaignId: '',
      change: 0,
      description: 'manual',
      targetId: '',
      serviceName: '',
    },
  });

  const ownerType = form.watch('ownerType');
  const ownerId = form.watch('ownerId');

  const onSubmit = async (values: GiveScoreFormValues) => {
    if (!values.ownerId) return;
    try {
      await changeScore({
        variables: {
          ownerType: values.ownerType,
          ownerId: values.ownerId,
          campaignId: values.campaignId || undefined,
          action: 'add',
          change: Number(values.change),
          description: values.description || 'manual',
          targetId: values.targetId || undefined,
          serviceName: values.serviceName || undefined,
        },
      });
      toast({
        title: 'Success',
        description: 'Score given successfully',
        variant: 'default',
      });
      setOpen(false);
      setTargetType(null);
      setSelectedDealName('');
      form.reset({
        ownerType: 'customer',
        ownerId: '',
        campaignId: '',
        change: 0,
        description: 'manual',
        targetId: '',
        serviceName: '',
      });
    } catch (e: unknown) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : String(e),
        variant: 'destructive',
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen} modal>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          {triggerLabel}
        </Button>
      </Sheet.Trigger>
      <Sheet.View className="sm:max-w-2xl p-0">
        <Sheet.Header className="border-b gap-3 px-6 py-4">
          <Sheet.Title>Give Score</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="p-6 w-full">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <Form.Field
                control={form.control}
                name="ownerType"
                rules={{ required: 'Owner type is required' }}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Owner Type *</Form.Label>
                    <SelectOwnerTypeFormItem
                      value={field.value}
                      onValueChange={(val) => {
                        field.onChange(val);
                        form.setValue('ownerId', '');
                      }}
                    />
                    <Form.Message />
                  </Form.Item>
                )}
              />

              {ownerType === 'customer' && (
                <Form.Field
                  control={form.control}
                  name="ownerId"
                  rules={{ required: 'Owner is required' }}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Owner *</Form.Label>
                      <SelectScoreCustomerFormItem
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Choose customer"
                      />
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              )}

              {ownerType === 'company' && (
                <Form.Field
                  control={form.control}
                  name="ownerId"
                  rules={{ required: 'Owner is required' }}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Owner *</Form.Label>
                      <SelectCompanyFormItem
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Choose company"
                      />
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              )}

              {ownerType === 'user' && (
                <Form.Field
                  control={form.control}
                  name="ownerId"
                  rules={{ required: 'Owner is required' }}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Owner *</Form.Label>
                      <SelectUserFormItem
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Choose team member"
                      />
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              )}

              {ownerType === 'cpUser' && (
                <Form.Field
                  control={form.control}
                  name="ownerId"
                  rules={{ required: 'Owner is required' }}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Owner *</Form.Label>
                      <SelectClientPortalUserFormItem
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Choose client portal user"
                      />
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              )}

              {ownerId && (
                <div className="flex flex-col gap-2 w-full">
                  <span className="text-sm font-medium leading-none">
                    Target
                  </span>
                  <Tabs
                    value={targetType || ''}
                    onValueChange={(val) => {
                      const next = (val as TargetType) || null;
                      setTargetType(next);
                      setSelectedDealName('');
                      form.setValue('targetId', '');
                      form.setValue('serviceName', next || '');
                      if (next === 'sales') setDealSheetOpen(true);
                    }}
                  >
                    <Tabs.List className="bg-accent rounded-md w-full px-1 flex items-center gap-2 border-none no-underline!">
                      <Tabs.Trigger
                        value="sales"
                        className="flex-1 cursor-pointer w-[50%] font-normal gap-1.5 data-[state=active]:bg-background bg-background data-[state=active]:shadow after:content-none after:border-none after:shadow-none after:bg-transparent"
                      >
                        <IconBriefcase size={15} />
                        Sales pipeline
                      </Tabs.Trigger>
                      <Tabs.Trigger
                        value="pos"
                        className="flex-1 cursor-pointer font-normal w-[50%] gap-1.5 data-[state=active]:bg-background bg-background data-[state=active]:shadow after:content-none after:border-none after:shadow-none after:bg-transparent"
                      >
                        <IconShoppingCart size={15} />
                        POS Order
                      </Tabs.Trigger>
                    </Tabs.List>
                  </Tabs>

                  {targetType === 'sales' && selectedDealName && (
                    <div className="flex items-center justify-between rounded-md border border-input bg-accent/50 px-3 py-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <IconBriefcase
                          size={14}
                          className="text-muted-foreground shrink-0"
                        />
                        <span className="text-sm truncate">
                          {selectedDealName}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDealSheetOpen(true)}
                        className="text-xs text-primary hover:underline shrink-0 ml-2"
                      >
                        Change
                      </button>
                    </div>
                  )}
                </div>
              )}

              <Form.Field
                control={form.control}
                name="campaignId"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Score Campaign</Form.Label>
                    <SelectScoreCampaignFormItem
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Choose score campaign (optional)"
                    />
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="change"
                rules={{
                  required: 'Score is required',
                  validate: (v) => Number(v) !== 0 || 'Score cannot be zero',
                }}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Score *</Form.Label>
                    <Form.Control>
                      <Input
                        type="number"
                        {...field}
                        value={field.value === 0 ? '' : field.value}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === '' ? 0 : Number(e.target.value),
                          )
                        }
                        placeholder="0"
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="description"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Description</Form.Label>
                    <Form.Control>
                      <Input {...field} placeholder="manual" />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Close
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </Form>
        </Sheet.Content>
      </Sheet.View>

      <ChooseDealSheet
        open={dealSheetOpen}
        onOpenChange={setDealSheetOpen}
        onSelect={(deal) => {
          form.setValue('targetId', deal._id);
          setSelectedDealName(
            deal.number ? `${deal.name} (${deal.number})` : deal.name,
          );
        }}
      />
    </Sheet>
  );
};
