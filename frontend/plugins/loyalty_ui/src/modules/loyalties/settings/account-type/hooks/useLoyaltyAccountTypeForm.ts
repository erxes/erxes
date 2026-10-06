import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { activeTiers, ILoyaltyAccountType } from '../types';
import {
  useLoyaltyAccountTypeAdd,
  useLoyaltyAccountTypeEdit,
} from './useLoyaltyAccountTypeMutations';

export const loyaltyAccountTypeFormSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required'),
    ownerType: z.enum(['customer', 'company', 'user']),
    frozenBlocks: z.enum(['spending', 'all']),
    // Lowest first; the key keeps a renamed tier the same tier on records.
    tiers: z
      .array(
        z.object({
          key: z.string().optional(),
          name: z.string().trim().min(1, 'Tier name is required'),
        }),
      )
      .superRefine((tiers, ctx) => {
        const seen = new Set<string>();

        tiers.forEach(({ name }, index) => {
          const normalized = name.trim().toLowerCase();

          if (normalized && seen.has(normalized)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'Tier names must be unique',
              path: [index, 'name'],
            });
          }

          seen.add(normalized);
        });
      }),
    reset: z.object({
      period: z.enum(['never', 'monthly', 'yearly']),
      tierTo: z.enum(['keep', 'none', 'lowest']),
    }),
    expiry: z.object({
      mode: z.enum(['none', 'calendar', 'rolling']),
      months: z.coerce.number().int().optional(),
    }),
    pendingDays: z.coerce.number().int().min(0, 'Must be zero or more'),
    currencyRatio: z.coerce.number().positive('Must be more than zero'),
    pointValue: z.coerce.number().positive('Must be more than zero'),
  })
  .superRefine(({ expiry, reset }, ctx) => {
    if (expiry.mode === 'calendar' && reset.period === 'never') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Choose a monthly or yearly reset period',
        path: ['reset', 'period'],
      });
    }

    if (expiry.mode === 'rolling' && !(Number(expiry.months) >= 1)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Enter the number of months',
        path: ['expiry', 'months'],
      });
    }
  });

export type TLoyaltyAccountTypeFormValues = z.infer<
  typeof loyaltyAccountTypeFormSchema
>;

const DEFAULT_VALUES: TLoyaltyAccountTypeFormValues = {
  name: '',
  ownerType: 'customer',
  frozenBlocks: 'spending',
  tiers: [],
  reset: { period: 'never', tierTo: 'keep' },
  expiry: { mode: 'none', months: 12 },
  pendingDays: 0,
  currencyRatio: 1,
  pointValue: 1,
};

const toFormValues = (
  accountType: ILoyaltyAccountType,
): TLoyaltyAccountTypeFormValues => ({
  name: accountType.name,
  ownerType: accountType.ownerType,
  frozenBlocks: accountType.frozenBlocks || 'spending',
  tiers: activeTiers(accountType.tiers).map(({ key, name }) => ({ key, name })),
  reset: {
    period: accountType.reset?.period || 'never',
    tierTo: accountType.reset?.tierTo || 'keep',
  },
  expiry: {
    mode: accountType.expiry?.mode || 'none',
    months: accountType.expiry?.months ?? 12,
  },
  pendingDays: accountType.pendingDays ?? 0,
  currencyRatio: accountType.currencyRatio ?? 1,
  pointValue: accountType.pointValue ?? 1,
});

export const useLoyaltyAccountTypeForm = ({
  accountType,
  open,
  onDone,
}: {
  accountType?: ILoyaltyAccountType;
  open: boolean;
  onDone: () => void;
}) => {
  const form = useForm<TLoyaltyAccountTypeFormValues>({
    resolver: zodResolver(loyaltyAccountTypeFormSchema),
    defaultValues: DEFAULT_VALUES,
  });
  const { run: add, loading: adding } = useLoyaltyAccountTypeAdd();
  const { run: edit, loading: editing } = useLoyaltyAccountTypeEdit();

  useEffect(() => {
    if (open) {
      form.reset(accountType ? toFormValues(accountType) : DEFAULT_VALUES);
    }
  }, [open, accountType, form]);

  const onSubmit = form.handleSubmit(({ ownerType, expiry, ...rest }) => {
    const values = {
      ...rest,
      expiry:
        expiry.mode === 'rolling'
          ? { mode: expiry.mode, months: expiry.months }
          : { mode: expiry.mode },
    };

    if (accountType) {
      edit({ _id: accountType._id, ...values }, onDone);
      return;
    }

    add({ ownerType, ...values }, onDone);
  });

  // What a point is worth back to the customer, as a share of their spend.
  const [currencyRatio, pointValue] = useWatch({
    control: form.control,
    name: ['currencyRatio', 'pointValue'],
  });
  const cashbackPercent =
    Number(currencyRatio) > 0
      ? (Number(pointValue) / Number(currencyRatio)) * 100
      : undefined;

  return {
    form,
    onSubmit,
    cashbackPercent,
    isEdit: !!accountType,
    loading: adding || editing,
  };
};
