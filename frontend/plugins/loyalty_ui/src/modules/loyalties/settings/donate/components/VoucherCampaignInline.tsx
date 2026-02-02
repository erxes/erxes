import {
  isUndefinedOrNull,
  Skeleton,
  TextOverflowTooltip,
  Tooltip,
} from 'erxes-ui';
import { useEffect, useMemo, useState } from 'react';
import {
  useVoucherCampaignInlineContext,
  VoucherCampaignInlineContext,
} from '../context/VoucherCampaginInlineContext';
import { useVoucherCampaignInline } from '../hooks/useVoucherCampaignInline';
import {
  IVoucherCampaign,
  VoucherCampaignInlineProps,
} from '../types/voucherCampaignType';

const VoucherCampaignInlineRoot = (props: VoucherCampaignInlineProps) => {
  return (
    <VoucherCampaignInlineProvider {...props}>
      <VoucherCampaignInlineTitle />
    </VoucherCampaignInlineProvider>
  );
};

const VoucherCampaignInlineProvider = ({
  children,
  voucherCampaignId,
  voucherCampaigns,
  placeholder,
  updateVoucherCampaigns,
}: VoucherCampaignInlineProps & { children?: React.ReactNode }) => {
  const [selectedVoucherCampaigns, setSelectedVoucherCampaigns] = useState<
    IVoucherCampaign[]
  >(voucherCampaigns || []);

  const contextValue = useMemo(() => {
    const normalizedVoucherCampaignId = Array.isArray(voucherCampaignId)
      ? voucherCampaignId
      : voucherCampaignId && [voucherCampaignId] || [];

    return {
      voucherCampaigns: voucherCampaigns || selectedVoucherCampaigns,
      loading: false,
      voucherCampaignId: normalizedVoucherCampaignId,
      placeholder: isUndefinedOrNull(placeholder)
        ? 'Select voucher campaigns'
        : placeholder,
      updateVoucherCampaigns: updateVoucherCampaigns || setSelectedVoucherCampaigns,
    };
  }, [
    voucherCampaigns,
    selectedVoucherCampaigns,
    voucherCampaignId,
    placeholder,
    updateVoucherCampaigns,
  ]);

  return (
    <VoucherCampaignInlineContext.Provider value={contextValue}>
      {children}
      {voucherCampaignId &&
        (Array.isArray(voucherCampaignId) ? (
          voucherCampaignId.map((id) => (
            <VoucherCampaignInlineEffectComponent key={id} campaignId={id} />
          ))
        ) : (
          <VoucherCampaignInlineEffectComponent
            key={voucherCampaignId}
            campaignId={voucherCampaignId}
          />
        ))}
    </VoucherCampaignInlineContext.Provider>
  );
};

const VoucherCampaignInlineEffectComponent = ({
  campaignId,
}: {
  campaignId: string;
}) => {
  const { voucherCampaigns, updateVoucherCampaigns } =
    useVoucherCampaignInlineContext();
  const { campaignDetail } = useVoucherCampaignInline({
    variables: {
      _id: campaignId,
    },
  });

  useEffect(() => {
    const newCampaigns = [...voucherCampaigns].filter(
      (c) => c._id !== campaignId,
    );

    if (campaignDetail) {
      updateVoucherCampaigns?.([...newCampaigns, campaignDetail]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignDetail]);

  return null;
};

const VoucherCampaignInlineTitle = () => {
  const { voucherCampaigns, loading, placeholder } =
    useVoucherCampaignInlineContext();

  if (loading) {
    return <Skeleton className="w-full flex-1 h-4" />;
  }

  if (voucherCampaigns.length === 0) {
    return <span className="text-accent-foreground/70">{placeholder}</span>;
  }

  if (voucherCampaigns.length < 3) {
    return (
      <TextOverflowTooltip
        value={voucherCampaigns
          .map((c) => c.name || 'Unnamed Campaign')
          .join(', ')}
      />
    );
  }

  return (
    <Tooltip.Provider>
      <Tooltip>
        <Tooltip.Trigger asChild>
          <span>{`${voucherCampaigns.length} voucher campaigns`}</span>
        </Tooltip.Trigger>
        <Tooltip.Content>
          {voucherCampaigns.map((c) => c.name || 'Unnamed Campaign').join(', ')}
        </Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};

export const VoucherCampaignInline = Object.assign(VoucherCampaignInlineRoot, {
  Provider: VoucherCampaignInlineProvider,
  Title: VoucherCampaignInlineTitle,
});
