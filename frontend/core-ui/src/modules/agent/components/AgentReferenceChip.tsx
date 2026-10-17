import { Tooltip, cn } from 'erxes-ui';
import { useAtomValue, useSetAtom } from 'jotai';
import { pluginsConfigState, usePermissionCheck } from 'ui-modules';
import { getApolloContext } from '@apollo/client';
import { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

import {
  agentSidePanelOpenState,
  agentSidePanelThreadRequestState,
} from '../states/agentPanelStates';
import {
  AGENT_REFERENCE_TARGETS,
  decodeAgentPagePath,
} from '../references/agentReferenceTargets';
import type { IAgentReference } from '../references/parseAgentReferences';
import { useAgentChatThreadId } from '../states/agentChatContext';
import { agentNavigationCatalogState } from '../states/agentNavigationCatalogState';
import { isKnownCatalogPage } from '../utils/navigationCatalog';
import { useTranslation } from 'react-i18next';

export interface IAgentReferenceChipProps {
  reference: IAgentReference;
}

/**
 * Inline record chip rendered inside assistant text: type icon + label.
 * Clickable when the target page exists (plugin loaded) and the user holds
 * the target module's permission — otherwise it stays a plain pill.
 *
 * Clicking inside the full `/agent` page also opens the side panel on the
 * same thread so the conversation survives the navigation.
 */
export const AgentReferenceChip = ({
  reference,
}: IAgentReferenceChipProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'agent.reference-types' });
  const navigate = useNavigate();
  const { pathname } = useLocation();
  // `resolvePath` targets (deal) need the client, but the chip must stay
  // renderable without one — unlike `useApolloClient`, reading the context
  // directly does not throw outside an ApolloProvider.
  const client = useContext(getApolloContext()).client;
  const pluginsConfig = useAtomValue(pluginsConfigState);
  const { isLoaded, hasModulePermission } = usePermissionCheck();
  const setPanelOpen = useSetAtom(agentSidePanelOpenState);
  const requestPanelThread = useSetAtom(agentSidePanelThreadRequestState);
  const threadId = useAgentChatThreadId();
  const [resolving, setResolving] = useState(false);
  const catalog = useAtomValue(agentNavigationCatalogState);

  const target = AGENT_REFERENCE_TARGETS[reference.type];
  const pluginReady =
    !target.pluginRemote || Boolean(pluginsConfig?.[target.pluginRemote]);
  const permitted =
    isLoaded &&
    (!target.permissionModule ||
      hasModulePermission(target.permissionModule));

  const pagePath =
    reference.type === 'page' ? decodeAgentPagePath(reference.id) : null;
  const pageKnown =
    pagePath !== null && isKnownCatalogPage(catalog, pagePath);

  const clickable =
    pluginReady && permitted && (reference.type !== 'page' || pageKnown);
  const typeLabel = t(target.labelKey, target.type);
  const Icon = target.icon;

  const handleClick = () => {
    if (resolving) return;

    const reopenPanel = () => {
      if (pathname.startsWith('/agent') && threadId) {
        requestPanelThread(threadId);
        setPanelOpen(true);
      }
    };

    if (reference.type === 'page') {
      if (pagePath && pageKnown) {
        navigate(pagePath);
        reopenPanel();
      }
      return;
    }

    const fallback = () => target.path(encodeURIComponent(reference.id));

    if (!target.resolvePath || !client) {
      navigate(fallback());
      reopenPanel();
      return;
    }

    setResolving(true);
    target
      .resolvePath(reference.id, client)
      .catch(() => null)
      .then((resolved) => {
        navigate(resolved ?? fallback());
        reopenPanel();
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

  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip>
        <Tooltip.Trigger asChild>
          {clickable ? (
            <button
              type="button"
              onClick={handleClick}
              className="inline-flex align-baseline"
              aria-label={`${typeLabel}: ${reference.label}`}
              aria-busy={resolving}
              disabled={resolving}
            >
              {chip}
            </button>
          ) : (
            chip
          )}
        </Tooltip.Trigger>
        <Tooltip.Content>{typeLabel}</Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};
