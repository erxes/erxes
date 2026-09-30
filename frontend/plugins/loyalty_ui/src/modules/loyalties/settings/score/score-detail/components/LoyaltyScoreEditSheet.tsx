import { fromSubtractInput } from '../../utils/spendRulesForm';
import { fromAddInput } from '../../utils/earnTableForm';
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
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('loyalty');
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
      },
      add: fromAddInput(),
      subtract: fromSubtractInput(),
      accountTypeId: '',
    },
  });

  useEffect(() => {
    if (scoreDetail && scoreDetail._id === editScoreId) {
      const restrictions = scoreDetail.restrictions || {};
      const additionalConfig = scoreDetail.additionalConfig || {};

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
        },
        add: fromAddInput(scoreDetail.add),
        subtract: fromSubtractInput(scoreDetail.subtract),
        accountTypeId: scoreDetail.accountTypeId || '',
        legacyDefaultScore: !scoreDetail.accountTypeId,
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
        className="p-0 md:max-w-7xl md:w-[calc(100vw-(--spacing(4)))] flex flex-col gap-0 overflow-hidden"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <Sheet.Header>
          <Sheet.Title>{t('edit-score-campaign')}</Sheet.Title>
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
