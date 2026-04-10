import {
  isUndefinedOrNull,
  Skeleton,
  TextOverflowTooltip,
  Tooltip,
} from 'erxes-ui';
import { useMemo, useState } from 'react';
import {
  useLotteryCampaignInlineContext,
  LotteryCampaignInlineContext,
} from '../context/LotteryCampaignInlineContext';
import { useLotteryCampaign } from '../hooks/useSelectLotteryCampaign';
import {
  ILotteryCampaign,
  LotteryCampaignInlineProps,
} from '../types/lotteryCampaignType';

const LotteryCampaignInlineRoot = (props: LotteryCampaignInlineProps) => {
  return (
    <LotteryCampaignInlineProvider {...props}>
      <LotteryCampaignInlineTitle />
    </LotteryCampaignInlineProvider>
  );
};

const LotteryCampaignInlineProvider = ({
  children,
  lotteryCampaignId,
  lotteryCampaigns,
  placeholder,
  updateLotteryCampaigns,
}: LotteryCampaignInlineProps & { children?: React.ReactNode }) => {
  const [currentLotteryCampaigns, setCurrentLotteryCampaigns] = useState<
    ILotteryCampaign[]
  >(lotteryCampaigns || []);
  const contextValue = useMemo(() => {
    const normalizedLotteryCampaignId = Array.isArray(lotteryCampaignId)
      ? lotteryCampaignId
      : (lotteryCampaignId && [lotteryCampaignId]) || [];

    return {
      lotteryCampaigns: lotteryCampaigns || currentLotteryCampaigns,
      loading: false,
      lotteryCampaignId: normalizedLotteryCampaignId,
      placeholder: isUndefinedOrNull(placeholder)
        ? 'Select lottery campaigns'
        : placeholder,
      updateLotteryCampaigns:
        updateLotteryCampaigns || setCurrentLotteryCampaigns,
    };
  }, [
    lotteryCampaignId,
    lotteryCampaigns,
    currentLotteryCampaigns,
    placeholder,
    updateLotteryCampaigns,
  ]);

  return (
    <LotteryCampaignInlineContext.Provider value={contextValue}>
      {children}
    </LotteryCampaignInlineContext.Provider>
  );
};

const LotteryCampaignInlineTitle = () => {
  const { lotteryCampaignId, lotteryCampaigns, loading, placeholder } =
    useLotteryCampaignInlineContext();

  const targetId = lotteryCampaignId?.[0];

  // First try to find from already-loaded campaigns in context
  const campaignFromContext = lotteryCampaigns?.find((c) => c._id === targetId);

  // Only query API if not found in context
  const { campaignList, loading: listLoading } = useLotteryCampaign({
    variables: { searchValue: '' },
    skip: !targetId || !!campaignFromContext,
  } as any);

  if (loading || listLoading) {
    return <Skeleton className="h-4 w-32" />;
  }

  const campaign =
    campaignFromContext || campaignList?.find((c) => c._id === targetId);

  if (!campaign) {
    return (
      <span className="text-muted-foreground">
        {placeholder ?? 'No campaign selected'}
      </span>
    );
  }

  return (
    <Tooltip>
      <Tooltip.Trigger>
        <TextOverflowTooltip value={campaign.title || 'Untitled Campaign'} />
      </Tooltip.Trigger>
      <Tooltip.Content>
        <p>{campaign.title}</p>
        {campaign.description && (
          <p className="text-sm text-muted-foreground">
            {campaign.description}
          </p>
        )}
      </Tooltip.Content>
    </Tooltip>
  );
};

export default LotteryCampaignInlineRoot;
