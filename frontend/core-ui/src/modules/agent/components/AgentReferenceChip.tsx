import { Tooltip, cn } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import {
  pluginsConfigState,
  SIDE_PANEL_CHAT_PATH,
  SIDE_PANEL_QUERY_KEY,
  usePermissionCheck,
} from 'ui-modules';
import { getApolloContext } from '@apollo/client';
import { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

import {
  AGENT_REFERENCE_TARGETS,
  decodeAgentPagePath,
} from '../references/agentReferenceTargets';
import type { IAgentReference } from '../references/parseAgentReferences';
import { agentNavigationCatalogState } from '../states/agentNavigationCatalogState';
import { isKnownCatalogPage } from '../utils/navigationCatalog';
import { useTranslation } from 'react-i18next';

export interface IAgentReferenceChipProps {
  reference: IAgentReference;
  /** HTML previews supply their own isolated styles; no cross-frame tooltip. */
  embedded?: boolean;
}

/**
 * Inline record chip rendered inside assistant text: type icon + label.
 * Clickable when the target page exists (plugin loaded) and the user holds
 * the target module's permission — otherwise it stays a plain pill.
 *
 * Keeps the Assistant side panel open while navigating to a record.
 */
export const AgentReferenceChip = ({
  reference,
  embedded = false,
}: IAgentReferenceChipProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'agent.reference-types',
  });
  const navigate = useNavigate();
  const { search } = useLocation();
  // `resolvePath` targets (deal) need the client, but the chip must stay
  // renderable without one — unlike `useApolloClient`, reading the context
  // directly does not throw outside an ApolloProvider.
  const client = useContext(getApolloContext()).client;
  const pluginsConfig = useAtomValue(pluginsConfigState);
  const { isLoaded, hasModulePermission } = usePermissionCheck();
  const [resolving, setResolving] = useState(false);
  const catalog = useAtomValue(agentNavigationCatalogState);

  const target = AGENT_REFERENCE_TARGETS[reference.type];
  const pluginReady =
    !target.pluginRemote || Boolean(pluginsConfig?.[target.pluginRemote]);
  const permitted =
    isLoaded &&
    (!target.permissionModule || hasModulePermission(target.permissionModule));

  const pagePath =
    reference.type === 'page' ? decodeAgentPagePath(reference.id) : null;
  const pageKnown = pagePath !== null && isKnownCatalogPage(catalog, pagePath);

  const clickable =
    pluginReady && permitted && (reference.type !== 'page' || pageKnown);
  const typeLabel = t(target.labelKey, target.type);
  const Icon = target.icon;

  const handleClick = () => {
    if (resolving) return;

    const navigateToTarget = (path: string) => {
      const panelOpen =
        new URLSearchParams(search).get(SIDE_PANEL_QUERY_KEY) ===
        SIDE_PANEL_CHAT_PATH;
      if (panelOpen) {
        const destination = new URL(path, window.location.origin);
        destination.searchParams.set(
          SIDE_PANEL_QUERY_KEY,
          SIDE_PANEL_CHAT_PATH,
        );
        navigate({
          pathname: destination.pathname,
          search: destination.search,
          hash: destination.hash,
        });
      } else navigate(path);
    };

    if (reference.type === 'page') {
      if (pagePath && pageKnown) {
        navigateToTarget(pagePath);
      }
      return;
    }

    const fallback = () => target.path(encodeURIComponent(reference.id));

    if (!target.resolvePath || !client) {
      navigateToTarget(fallback());
      return;
    }

    setResolving(true);
    void target
      .resolvePath(reference.id, client)
      .catch(() => null)
      .then((resolved) => {
        navigateToTarget(resolved ?? fallback());
      })
      .finally(() => setResolving(false));
  };

  const chip = (
    <span
      className={cn(
        'mx-0.5 inline-flex max-w-[16rem] translate-y-[-1px] items-center gap-1 rounded-full border bg-muted/40 px-2 py-0.5 align-baseline text-[0.92em] font-medium',
        clickable && 'cursor-pointer hover:bg-muted',
      )}
    >
      {reference.type !== 'page' && (
        <Icon className="size-3.5 shrink-0 text-muted-foreground" />
      )}
      <span className="truncate">{reference.label}</span>
      {reference.type === 'page' && (
        <Icon className="size-3.5 shrink-0 text-muted-foreground" />
      )}
    </span>
  );

  const trigger = clickable ? (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex align-baseline"
      aria-label={`${typeLabel}: ${reference.label}`}
      aria-busy={resolving}
      disabled={resolving}
      title={embedded ? typeLabel : undefined}
    >
      {chip}
    </button>
  ) : (
    chip
  );

  if (embedded) return trigger;

  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip>
        <Tooltip.Trigger asChild>{trigger}</Tooltip.Trigger>
        <Tooltip.Content>{typeLabel}</Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};
