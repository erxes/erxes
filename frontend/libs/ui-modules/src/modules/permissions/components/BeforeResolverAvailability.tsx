import { gql, useQuery } from '@apollo/client';
import { Spinner, Tooltip } from 'erxes-ui';
import type { ComponentProps, ReactNode } from 'react';

const BEFORE_RESOLVER_AVAILABLE = gql`
  query BeforeResolverAvailable($resolver: String!, $args: JSON) {
    beforeResolverAvailable(resolver: $resolver, args: $args)
  }
`;

export type BeforeResolverBlockedResult = {
  message?: string;
  code?: string;
  pluginName?: string;
  details?: Record<string, unknown>;
};

type BeforeResolverAvailableQuery = {
  beforeResolverAvailable?: {
    available?: boolean;
    blocked?: BeforeResolverBlockedResult[];
  };
};

type BeforeResolverAvailableQueryVariables = {
  resolver: string;
  args?: Record<string, unknown>;
};

export type BeforeResolverAvailabilityRenderProps = {
  disabled: boolean;
  checking: boolean;
  blocked: boolean;
  blockedReason?: ReactNode;
  blockedResults: BeforeResolverBlockedResult[];
};

export type BeforeResolverAvailabilityProps = {
  resolver: string;
  args?: Record<string, unknown>;
  skip?: boolean;
  blockedFallback?: ReactNode;
  loadingFallback?: ReactNode;
  tooltip?: boolean;
  tooltipSide?: ComponentProps<typeof Tooltip.Content>['side'];
  tooltipTriggerClassName?: string;
  children: ReactNode;
};

export const BeforeResolverAvailability = ({
  resolver,
  args,
  skip = false,
  blockedFallback,
  loadingFallback,
  tooltip = true,
  tooltipSide = 'right',
  tooltipTriggerClassName = 'inline-flex',
  children,
}: BeforeResolverAvailabilityProps) => {
  const { data, loading } = useQuery<
    BeforeResolverAvailableQuery,
    BeforeResolverAvailableQueryVariables
  >(BEFORE_RESOLVER_AVAILABLE, {
    variables: {
      resolver,
      args,
    },
    skip,
    fetchPolicy: 'cache-and-network',
  });

  const availability = data?.beforeResolverAvailable;
  const blocked = availability?.available === false;
  const blockedResults = availability?.blocked || [];
  const blockedReason = blocked
    ? blockedResults[0]?.message || blockedFallback
    : undefined;

  if (loading) {
    if (loadingFallback) {
      return loadingFallback;
    }
    return (
      <Spinner
        size="sm"
        containerClassName="inline-flex h-auto w-auto flex-none"
      />
    );
  }

  if (!blocked) {
    return children;
  }

  const fallback = blockedFallback || children;

  if (!tooltip || !blockedReason) {
    return fallback;
  }

  return (
    <Tooltip.Provider>
      <Tooltip>
        <Tooltip.Trigger asChild>
          <div className={tooltipTriggerClassName}>{fallback}</div>
        </Tooltip.Trigger>
        <Tooltip.Content
          side={tooltipSide}
          className="max-w-72 whitespace-normal"
        >
          {blockedReason}
        </Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};
