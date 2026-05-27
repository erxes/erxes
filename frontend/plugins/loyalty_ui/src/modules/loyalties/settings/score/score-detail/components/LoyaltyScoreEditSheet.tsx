import {
  Sheet,
  usePreviousHotkeyScope,
  useScopedHotkeys,
  useSetHotkeyScope,
  useQueryState,
} from 'erxes-ui';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoyaltyHotKeyScope } from '../../types/LoyaltyHotKeyScope';
import {
  loyaltyScoreFormSchema,
  LoyaltyScoreFormValues,
} from '../../constants/formSchema';
import { useScoreDetailWithQuery } from '../hooks/useScoreDetailWithQuery';
import { EditScoreForm } from './EditScoreForm';

const parseIds = (value: string | string[] | undefined): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return value.split(',').filter(Boolean);
};

export const LoyaltyScoreEditSheet = () => {
  const setHotkeyScope = useSetHotkeyScope();
  const [open, setOpen] = useState<boolean>(false);
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();
  const { scoreDetail } = useScoreDetailWithQuery();
  const [editScoreId, setEditScoreId] = useQueryState('editScoreId');

  const form = useForm<LoyaltyScoreFormValues>({
    resolver: zodResolver(loyaltyScoreFormSchema),
    defaultValues: {
      title: '',
      description: '',
      order: undefined,
      conditions: {
        serviceName: '',
        productCategoryIds: [],
        productIds: [],
        tagIds: [],
        excludeProductCategoryIds: [],
        excludeProductIds: [],
        excludeTagIds: [],
      },
      additionalConfig: {
        discountCheck: false,
        cardBasedRule: [
          { boardId: '', pipelineId: '', stageIds: [], refundStageIds: [] },
        ],
      },
      add: { placeholder: '', currencyRatio: '' },
      subtract: { placeholder: '', currencyRatio: '' },
      set: { placeholder: '', currencyRatio: '' },
      ownerType: '',
      onlyClientPortal: false,
      fieldGroupId: '',
    },
  });

  useEffect(() => {
    if (scoreDetail && scoreDetail._id === editScoreId) {
      const restrictions = scoreDetail.restrictions || {};
      const additionalConfig = scoreDetail.additionalConfig || {};
      const existingRules = Array.isArray(additionalConfig.cardBasedRule)
        ? additionalConfig.cardBasedRule.map((rule: any) => ({
            boardId: rule.boardId || '',
            pipelineId: rule.pipelineId || '',
            stageIds: Array.isArray(rule.stageIds) ? rule.stageIds : [],
            refundStageIds: Array.isArray(rule.refundStageIds)
              ? rule.refundStageIds
              : [],
          }))
        : [];

      form.reset({
        title: scoreDetail.title || '',
        description: scoreDetail.description || '',
        order: scoreDetail.order,
        conditions: {
          serviceName: scoreDetail.serviceName || '',
          productCategoryIds: parseIds(restrictions.productCategoryIds),
          productIds: parseIds(restrictions.productIds),
          tagIds: parseIds(restrictions.tagIds),
          excludeProductCategoryIds: parseIds(
            restrictions.excludeProductCategoryIds,
          ),
          excludeProductIds: parseIds(restrictions.excludeProductIds),
          excludeTagIds: parseIds(restrictions.excludeTagIds),
        },
        additionalConfig: {
          discountCheck: additionalConfig.discountCheck ?? false,
          cardBasedRule:
            existingRules.length > 0
              ? existingRules
              : [
                  {
                    boardId: '',
                    pipelineId: '',
                    stageIds: [],
                    refundStageIds: [],
                  },
                ],
        },
        add: {
          placeholder: scoreDetail.add?.placeholder || '',
          currencyRatio: scoreDetail.add?.currencyRatio || '',
        },
        subtract: {
          placeholder: scoreDetail.subtract?.placeholder || '',
          currencyRatio: scoreDetail.subtract?.currencyRatio || '',
        },
        set: {
          placeholder: scoreDetail.set?.placeholder || '',
          currencyRatio: scoreDetail.set?.currencyRatio || '',
        },
        ownerType: scoreDetail.ownerType || '',
        onlyClientPortal: scoreDetail.onlyClientPortal ?? false,
        fieldGroupId: scoreDetail.fieldGroupId || '',
        fieldOrigin: scoreDetail.fieldId ? 'exists' : 'new',
        fieldName: scoreDetail.fieldName || '',
        fieldId: scoreDetail.fieldId || '',
      });
    }
  }, [scoreDetail, editScoreId, form]);

  useEffect(() => {
    if (editScoreId) {
      setOpen(true);
      setHotkeyScopeAndMemorizePreviousScope(
        LoyaltyHotKeyScope.LoyaltyEditSheet,
      );
    } else {
      setOpen(false);
      setHotkeyScope(LoyaltyHotKeyScope.LoyaltiesPage);
    }
  }, [editScoreId, setHotkeyScope, setHotkeyScopeAndMemorizePreviousScope]);

  const onClose = () => {
    setEditScoreId(null);
  };

  useScopedHotkeys(`esc`, () => onClose(), LoyaltyHotKeyScope.LoyaltyEditSheet);

  return (
    <Sheet onOpenChange={(open) => !open && onClose()} open={open} modal>
      <Sheet.View
        className="lg:max-w-1/2 md:max-w-2/3 sm:max-w-md p-0"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <Sheet.Header>
          <Sheet.Title>Edit score campaign</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <EditScoreForm
          onOpenChange={(open) => !open && onClose()}
          form={form}
        />
      </Sheet.View>
    </Sheet>
  );
};
