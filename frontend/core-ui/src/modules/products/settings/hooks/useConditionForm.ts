import { useMutation } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from 'erxes-ui';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import {
  PRODUCT_CONDITIONS_ADD,
  PRODUCT_CONDITIONS_EDIT,
} from '@/products/settings/graphql/mutations/productConditions';
import { IProductCondition } from '../components/productsConfig/condition/types';

const conditionSchema = z.object({
  code: z.string().trim().min(1, 'Code is required'),
  name: z.string().trim().min(1, 'Name is required'),
  description: z.string().optional(),
});

export type ConditionFormValues = z.infer<typeof conditionSchema>;

export const useConditionForm = ({
  condition,
  defaultName,
  onDone,
}: {
  condition?: IProductCondition;
  // Prefills a new condition, e.g. from what was searched in a picker.
  defaultName?: string;
  onDone: (saved?: IProductCondition) => void;
}) => {
  const { t } = useTranslation('product');
  const { toast } = useToast();
  const form = useForm<ConditionFormValues>({
    resolver: zodResolver(conditionSchema),
    defaultValues: {
      code: condition?.code || '',
      name: condition?.name || defaultName || '',
      description: condition?.description || '',
    },
  });
  const code = useWatch({ control: form.control, name: 'code' });

  const onSaved = (saved?: IProductCondition) => {
    toast({ title: t('condition-saved', 'Saved') });
    onDone(saved);
  };
  const options = {
    refetchQueries: ['productConditions'],
    awaitRefetchQueries: true,
    onError: (e: Error) =>
      toast({
        title: t('error', 'Error'),
        description: e.message,
        variant: 'destructive',
      }),
  };
  const [addCondition, { loading: adding }] = useMutation<{
    productConditionsAdd: IProductCondition;
  }>(PRODUCT_CONDITIONS_ADD, {
    ...options,
    onCompleted: (data) => onSaved(data.productConditionsAdd),
  });
  const [editCondition, { loading: editing }] = useMutation<{
    productConditionsEdit: IProductCondition;
  }>(PRODUCT_CONDITIONS_EDIT, {
    ...options,
    onCompleted: (data) => onSaved(data.productConditionsEdit),
  });

  const submit = form.handleSubmit((values) => {
    const variables = {
      code: values.code.trim(),
      name: values.name.trim(),
      description: values.description || null,
    };

    if (condition) {
      editCondition({ variables: { _id: condition._id, ...variables } });
    } else {
      addCondition({ variables });
    }
  });

  // Products and pricing plans hold the code, so a new one leaves them behind.
  const codeChanged = !!condition && code.trim() !== condition.code;

  return {
    form,
    submit,
    codeChanged,
    saving: adding || editing,
  };
};
