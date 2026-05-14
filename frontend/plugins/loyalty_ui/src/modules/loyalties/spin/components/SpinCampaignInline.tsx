import {
  isUndefinedOrNull,
  Skeleton,
  TextOverflowTooltip,
  Tooltip,
} from 'erxes-ui';
import { useMemo, useState } from 'react';
import {
  useSpinCampaignInlineContext,
  SpinCampaignInlineContext,
} from '../context/SpinCampaignInlineContext';
import { useSpinCampaign } from '../hooks/useSelectSpinCampaign';
import {
  ISpinCampaign,
  SpinCampaignInlineProps,
} from '../types/spinCampaignType';

const SpinCampaignInlineRoot = (props: SpinCampaignInlineProps) => {
  return (
    <SpinCampaignInlineProvider {...props}>
      <SpinCampaignInlineTitle />
    </SpinCampaignInlineProvider>
  );
};

const SpinCampaignInlineProvider = ({
  children,
  spinCampaignId,
  spinCampaigns,
  placeholder,
  updateSpinCampaigns,
}: SpinCampaignInlineProps & { children?: React.ReactNode }) => {
  const [currentSpinCampaigns, setCurrentSpinCampaigns] = useState<
    ISpinCampaign[]
  >(spinCampaigns || []);
  const contextValue = useMemo(() => {
    const normalizedSpinCampaignId = Array.isArray(spinCampaignId)
      ? spinCampaignId
      : (spinCampaignId && [spinCampaignId]) || [];

    return {
      spinCampaigns: spinCampaigns || currentSpinCampaigns,
      loading: false,
      spinCampaignId: normalizedSpinCampaignId,
      placeholder: isUndefinedOrNull(placeholder)
        ? 'Select spin campaigns'
        : placeholder,
      updateSpinCampaigns: updateSpinCampaigns || setCurrentSpinCampaigns,
    };
  }, [
    spinCampaignId,
    spinCampaigns,
    currentSpinCampaigns,
    placeholder,
    updateSpinCampaigns,
  ]);

  return (
    <SpinCampaignInlineContext.Provider value={contextValue}>
      {children}
    </SpinCampaignInlineContext.Provider>
  );
};

const SpinCampaignInlineTitle = () => {
  const { spinCampaignId, spinCampaigns, loading, placeholder } =
    useSpinCampaignInlineContext();

  const targetId = spinCampaignId?.[0];

  const campaignFromContext = spinCampaigns?.find((c) => c._id === targetId);

  const { campaignList, loading: listLoading } = useSpinCampaign({
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

export default SpinCampaignInlineRoot;
