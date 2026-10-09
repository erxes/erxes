import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { IPricingConditionRule } from '@/pricing/types';

const conditionRuleSchema = (takenCodes: string[]) =>
  z
    .object({
      conditionCode: z.string().min(1, 'Choose a condition'),
      discountType: z.enum(['default', 'subtraction', 'percentage', 'bonus']),
      discountValue: z
        .number({ invalid_type_error: 'Enter a value' })
        .min(0, 'At least 0'),
      discountBonusProduct: z.string().nullable().optional(),
      priceAdjustType: z.string(),
      priceAdjustFactor: z
        .number({ invalid_type_error: 'Enter a value' })
        .int('Whole numbers only')
        .min(0, 'At least 0'),
    })
    .superRefine((rule, ctx) => {
      if (takenCodes.includes(rule.conditionCode)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['conditionCode'],
          message: 'This condition already has a discount',
        });
      }

      if (rule.discountType === 'percentage' && rule.discountValue > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['discountValue'],
          message: 'At most 100%',
        });
      }

      if (rule.discountType === 'bonus' && !rule.discountBonusProduct) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['discountBonusProduct'],
          message: 'Choose a bonus product',
        });
      }
    });

const EMPTY_RULE: IPricingConditionRule = {
  conditionCode: '',
  discountType: 'percentage',
  discountValue: 0,
  discountBonusProduct: null,
  priceAdjustType: 'none',
  priceAdjustFactor: 0,
};

export const useConditionRuleForm = ({
  open,
  rule,
  takenCodes,
}: {
  open: boolean;
  rule: IPricingConditionRule | null;
  takenCodes: string[];
}) => {
  const form = useForm<IPricingConditionRule>({
    resolver: zodResolver(conditionRuleSchema(takenCodes)),
    defaultValues: EMPTY_RULE,
  });

  useEffect(() => {
    if (open) {
      form.reset(rule || EMPTY_RULE);
    }
  }, [form, open, rule]);

  return { form, discountType: form.watch('discountType') };
};
