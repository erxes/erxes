import { useApolloClient, useQuery } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { IProductData } from 'ui-modules';
import { normalizeProductUom } from '@/deals/cards/components/detail/product/utils/productUom';
import { useDealsEdit } from '@/deals/cards/hooks/useDeals';
import { DEAL_TOAST_OPTIONS } from '@/deals/constants/toast';
import { useLoyaltyEnabled } from '@/deals/loyaltyRules/hooks/useLoyaltyEnabled';
import { IDeal } from '@/deals/types/deals';
import {
  DEAL_COUPON_CHECK,
  DEAL_SALE_VOUCHERS,
} from '../graphql/dealVoucherQueries';
import {
  groupDealVouchers,
  IDealSaleVoucher,
} from '../utils/dealVoucherGroups';

/**
 * The deal's voucher and coupon: what its first customer may pick, and
 * saving a choice with the products so the deal is priced again.
 */
export const useDealVouchers = (deal: IDeal) => {
  const { t } = useTranslation('sales');
  const client = useApolloClient();
  const enabled = useLoyaltyEnabled();
  const [customer] = deal.customers || [];
  const voucherId = deal.extraData?.voucherId || null;
  const couponCode = deal.extraData?.couponCode || null;

  // Bonus lines a voucher added carry bonusCount; the shared type omits it.
  const totalAmount = (deal.productsData || [])
    .filter(
      (pd: IProductData & { bonusCount?: number }) =>
        pd.tickUsed && !pd.bonusCount,
    )
    .reduce((sum, pd) => sum + (Number(pd.amount) || 0), 0);

  const { data, loading, refetch } = useQuery<{
    loyaltyOwnerSaleVouchers?: {
      vouchers: IDealSaleVoucher[];
      settled: boolean;
    } | null;
  }>(DEAL_SALE_VOUCHERS, {
    variables: { ownerId: customer?._id, totalAmount, targetId: deal._id },
    skip: !enabled || !customer?._id,
    fetchPolicy: 'cache-and-network',
  });
  const { editDeals, loading: saving } = useDealsEdit(undefined, {
    toastOptions: DEAL_TOAST_OPTIONS,
  });

  const vouchers = data?.loyaltyOwnerSaleVouchers?.vouchers || [];
  // Loyalty already used the pick on this deal; only a refund gives it back.
  const readOnly = !!data?.loyaltyOwnerSaleVouchers?.settled;
  const groups = groupDealVouchers(vouchers, voucherId);
  const pickable = groups.filter(
    ({ autoApplied, applicable, selected }) =>
      !autoApplied && applicable && !selected,
  );
  const singlePick = !voucherId && pickable.length === 1 ? pickable[0] : null;

  // The products go with the choice: only a full save prices the deal again.
  const save = async (extra: {
    voucherId?: string | null;
    couponCode?: string | null;
  }) => {
    try {
      // useDealsEdit has an onError, so a failure resolves without data.
      const result = await editDeals({
        variables: {
          _id: deal._id,
          processId: localStorage.getItem('processId') || '',
          extraData: { ...deal.extraData, ...extra },
          productsData: (deal.productsData || []).map((pd) => ({
            ...normalizeProductUom(pd, pd.product),
            productId: pd.product?._id || pd.productId,
          })),
        },
      });

      if (!result?.data) return false;

      await refetch();
      return true;
    } catch {
      // useDealsEdit shows why.
      return false;
    }
  };

  const toggleVoucher = (id: string) =>
    save({ voucherId: id === voucherId ? null : id });

  // Checked first, so a bad code never sticks to the deal.
  const applyCoupon = async (rawCode: string) => {
    const code = rawCode.trim();

    if (!code) return null;

    try {
      const { data: checked } = await client.query<{
        loyaltyCouponCheck: string;
      }>({
        query: DEAL_COUPON_CHECK,
        variables: {
          code,
          ownerId: customer?._id,
          totalAmount,
          targetId: deal._id,
        },
        fetchPolicy: 'network-only',
      });

      return (await save({ couponCode: code }))
        ? checked.loyaltyCouponCheck
        : null;
    } catch (e) {
      toast({
        title: t('error'),
        description: e instanceof Error ? e.message : String(e),
        variant: 'destructive',
        ...DEAL_TOAST_OPTIONS,
      });
      return null;
    }
  };

  return {
    visible: enabled && (!!customer?._id || !!couponCode),
    loading,
    saving,
    readOnly,
    voucherId,
    couponCode,
    chosen: vouchers.find(({ _id }) => _id === voucherId) || null,
    groups,
    singlePick,
    morePicks: singlePick ? 0 : pickable.length,
    toggleVoucher,
    applyCoupon,
    clearCoupon: () => save({ couponCode: null }),
  };
};

export type TDealVouchers = ReturnType<typeof useDealVouchers>;
