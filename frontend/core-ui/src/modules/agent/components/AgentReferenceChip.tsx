import { resolveAgentReference } from '../references/resolveAgentReference';
import { useAgentReferenceRegistry } from '../references/AgentReferenceScope';
import { referenceIdentity } from '../references/referenceRegistry';
import { Tooltip, cn } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import {
  pluginsConfigState,
  SIDE_PANEL_CHAT_PATH,
  SIDE_PANEL_QUERY_KEY,
  usePermissionCheck,
} from 'ui-modules';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

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
  reference: requestedReference,
  embedded = false,
}: IAgentReferenceChipProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'agent.reference-types',
  });
  const navigate = useNavigate();
  const { search } = useLocation();
  const pluginsConfig = useAtomValue(pluginsConfigState);
  const { isLoaded, hasModulePermission } = usePermissionCheck();
  const [resolution, setResolution] = useState<{
    identity: string;
    state: 'loading' | 'verified' | 'unavailable';
    label?: string;
  }>();
  const catalog = useAtomValue(agentNavigationCatalogState);

  const registry = useAgentReferenceRegistry();
  const canonical = registry.byIdentity.get(
    referenceIdentity(requestedReference),
  );
  const reference = canonical ?? requestedReference;
  const identity = referenceIdentity(reference);
  const currentTarget = useRef(identity);
  currentTarget.current = canonical ? identity : '';
  const operation = useRef(0);
  useEffect(
    () => () => {
      operation.current += 1;
    },
    [],
  );
  const resolving =
    resolution?.identity === identity && resolution.state === 'loading';
  const unavailable =
    resolution?.identity === identity && resolution.state === 'unavailable';
  const currentLabel =
    resolution?.identity === identity ? resolution.label : undefined;
  const target = AGENT_REFERENCE_TARGETS[reference.type];
  const pluginReady =
    !target.pluginRemote || Boolean(pluginsConfig?.[target.pluginRemote]);
  const permitted =
    isLoaded &&
    (!target.permissionModule || hasModulePermission(target.permissionModule));

  const pagePath =
    reference.type === 'page'
      ? reference.path ?? decodeAgentPagePath(reference.id)
      : null;
  const pageKnown = pagePath !== null && isKnownCatalogPage(catalog, pagePath);

  const clickable =
    Boolean(canonical) &&
    pluginReady &&
    permitted &&
    (reference.type !== 'page' || pageKnown);
  const displayLabel =
    currentLabel ??
    (reference.type === 'page'
      ? catalog.find((page) => page.path === pagePath)?.label
      : undefined) ??
    reference.label;
  const typeLabel = t(target.labelKey, target.type);
  const Icon = target.icon;

  const handleClick = () => {
    if (resolving || !clickable) return;

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

    const request = ++operation.current;
    setResolution({ identity, state: 'loading' });
    void resolveAgentReference(reference)
      .then((verified) => {
        if (request !== operation.current || currentTarget.current !== identity)
          return;
        setResolution({ identity, state: 'verified', label: verified.label });
        const path = target.path(
          encodeURIComponent(verified.id),
          verified.location,
        );
        if (!path) throw new Error('Missing record location');
        navigateToTarget(path);
      })
      .catch(() => {
        if (request === operation.current && currentTarget.current === identity)
          setResolution({ identity, state: 'unavailable' });
      });
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
      <span className="truncate">{displayLabel}</span>
      {unavailable && (
        <span className="text-[10px] text-muted-foreground">Unavailable</span>
      )}
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
      aria-label={`${typeLabel}: ${displayLabel}`}
      aria-busy={resolving}
      disabled={resolving}
      title={embedded ? typeLabel : undefined}
    >
      {chip}
    </button>
  ) : (
    chip
  );

  if (!canonical) return <span>{requestedReference.label}</span>;
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
