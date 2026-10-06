import { useMutation } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from 'erxes-ui';
import { useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import {
  PRODUCT_CONDITION_GROUPS_ADD,
  PRODUCT_CONDITION_GROUPS_EDIT,
} from '@/products/settings/graphql/mutations/productConditionGroups';
import { IProductConditionGroup } from '../components/productsConfig/conditionGroup/types';

const conditionGroupSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: z.string().optional(),
  conditions: z
    .array(
      z.object({
        conditionId: z.string().optional(),
        name: z.string().trim().min(1, 'Condition name is required'),
      }),
    )
    .min(1, 'Add at least one condition'),
});

export type ConditionGroupFormValues = z.infer<typeof conditionGroupSchema>;

// `conditionId` keeps a condition's _id through edits; pricing plans point at it.
export const useConditionGroupForm = ({
  group,
  onDone,
}: {
  group?: IProductConditionGroup;
  onDone: () => void;
}) => {
  const { t } = useTranslation('product');
  const { toast } = useToast();
  const form = useForm<ConditionGroupFormValues>({
    resolver: zodResolver(conditionGroupSchema),
    defaultValues: {
      name: group?.name || '',
      description: group?.description || '',
      conditions: group?.conditions.map(({ _id, name }) => ({
        conditionId: _id,
        name,
      })) || [{ name: '' }],
    },
  });
  const conditions = useFieldArray({
    control: form.control,
    name: 'conditions',
  });

  const options = {
    refetchQueries: ['productConditionGroups'],
    onCompleted: () => {
      toast({ title: t('condition-group-saved', 'Saved') });
      onDone();
    },
    onError: (e: Error) =>
      toast({
        title: t('error', 'Error'),
        description: e.message,
        variant: 'destructive',
      }),
  };
  const [addGroup, { loading: adding }] = useMutation(
    PRODUCT_CONDITION_GROUPS_ADD,
    options,
  );
  const [editGroup, { loading: editing }] = useMutation(
    PRODUCT_CONDITION_GROUPS_EDIT,
    options,
  );

  const submit = form.handleSubmit((values) => {
    const variables = {
      name: values.name,
      description: values.description || null,
      conditions: values.conditions.map(({ conditionId, name }) => ({
        _id: conditionId,
        name,
      })),
    };

    if (group) {
      editGroup({ variables: { _id: group._id, ...variables } });
    } else {
      addGroup({ variables });
    }
  });

  return {
    form,
    conditions,
    submit,
    saving: adding || editing,
  };
};
