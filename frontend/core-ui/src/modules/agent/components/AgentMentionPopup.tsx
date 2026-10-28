import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  type KeyboardEvent,
  type RefObject,
} from 'react';
import {
  Popover,
  SuggestionMenu,
  SuggestionMenuItem,
  cn,
  readImage,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';

import {
  useAgentMentionSearch,
  type IAgentMentionOption,
} from '../hooks/useAgentMentionSearch';
import { AGENT_REFERENCE_TARGETS } from '../references/agentReferenceTargets';
import { referenceIdentity } from '../references/referenceRegistry';
import type {
  IAgentMention,
  IAgentMentionQuery,
  TAgentMentionType,
} from '../utils/mentionText';
import { AGENTS_MENTION_MAX_PER_TURN } from '../agentMentions';

export interface IAgentMentionAnchor {
  left: number;
  top: number;
  height: number;
}

export interface IAgentMentionPopupHandle {
  /** Returns true when the open menu consumed the key. */
  handleKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => boolean;
}

export interface IAgentMentionPopupProps {
  query: IAgentMentionQuery;
  anchor: IAgentMentionAnchor;
  listboxId: string;
  /** Identities already in the text; they stay pickable at the limit. */
  mentioned: ReadonlySet<string>;
  /** The input wrapper; pointer events there never dismiss the menu. */
  containerRef: RefObject<HTMLElement>;
  onPick: (mention: IAgentMention) => void;
  onDismiss: () => void;
  onActiveOptionChange: (id: string | undefined) => void;
}

const GROUP_LABELS: Record<TAgentMentionType, string> = {
  user: 'Team members',
  customer: 'Customers',
  company: 'Companies',
  product: 'Products',
  structureEntity: 'Structure nodes',
  brand: 'Brands',
  deal: 'Deals',
  conversation: 'Conversations',
  automation: 'Automations',
};

const optionId = (listboxId: string, option: IAgentMentionOption) =>
  `${listboxId}-${option.mention.type}-${option.mention.id}`;

/**
 * Caret-anchored @ menu for the Assistant composer. It reuses erxes-ui's
 * `SuggestionMenu`/`SuggestionMenuItem` and the editor mention menu's item
 * layout (avatar or initial, `@name`, placeholder rows and status note), with
 * results grouped by record type. Focus stays in the textarea; the input
 * forwards navigation keys through the imperative handle.
 */
export const AgentMentionPopup = forwardRef<
  IAgentMentionPopupHandle,
  IAgentMentionPopupProps
>(
  (
    {
      query,
      anchor,
      listboxId,
      mentioned,
      containerRef,
      onPick,
      onDismiss,
      onActiveOptionChange,
    },
    ref,
  ) => {
    const { t } = useTranslation('common', { keyPrefix: 'agent' });
    const { groups, loading, failed } = useAgentMentionSearch(query.query);
    const options = groups.flatMap((group) => group.options);
    const queryKey = `${query.start}:${query.query}`;
    const [selection, setSelection] = useState({ key: queryKey, index: 0 });
    const index =
      selection.key === queryKey && options.length
        ? Math.min(selection.index, options.length - 1)
        : 0;
    const limitReached = mentioned.size >= AGENTS_MENTION_MAX_PER_TURN;
    const pickable = (option: IAgentMentionOption) =>
      !limitReached || mentioned.has(referenceIdentity(option.mention));
    const active = options[index];
    const activeId = active ? optionId(listboxId, active) : undefined;

    useEffect(() => {
      onActiveOptionChange(activeId);
    }, [activeId, onActiveOptionChange]);
    useEffect(
      () => () => onActiveOptionChange(undefined),
      [onActiveOptionChange],
    );

    const move = (delta: number) =>
      setSelection({
        key: queryKey,
        index: (index + delta + options.length) % options.length,
      });

    useImperativeHandle(ref, () => ({
      handleKeyDown: (event) => {
        if (event.nativeEvent.isComposing) return false;
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          if (!options.length) return false;
          event.preventDefault();
          move(event.key === 'ArrowDown' ? 1 : -1);
          return true;
        }
        if (
          (event.key === 'Enter' || event.key === 'Tab') &&
          !event.shiftKey &&
          !event.metaKey &&
          !event.ctrlKey &&
          !event.altKey
        ) {
          if (active && pickable(active)) {
            event.preventDefault();
            onPick(active.mention);
            return true;
          }
          // Never send a half-typed mention while its results are loading.
          if (event.key === 'Enter' && loading) {
            event.preventDefault();
            return true;
          }
          return false;
        }
        if (event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          onDismiss();
          return true;
        }
        return false;
      },
    }));

    const placeholder = limitReached
      ? options.some(pickable)
        ? undefined
        : t('mention-limit', {
            max: AGENTS_MENTION_MAX_PER_TURN,
            defaultValue: 'Up to {{max}} mentions per message',
          })
      : undefined;
    const emptyText = loading
      ? t('mention-searching', 'Searching…')
      : failed
      ? t('mention-unavailable', 'Search is unavailable. Try again.')
      : query.query.trim()
      ? t('mention-no-results', 'No results found')
      : t('mention-empty', 'No team members to show');
    const statusNote = query.query.trim()
      ? loading && options.length
        ? t('mention-searching', 'Searching…')
        : undefined
      : t('mention-hint', 'Type to search team members, contacts and records');
    let position = -1;

    return (
      <Popover open onOpenChange={(open) => !open && onDismiss()}>
        <Popover.Anchor asChild>
          <span
            aria-hidden
            className="pointer-events-none absolute w-px"
            style={{
              left: anchor.left,
              top: anchor.top,
              height: anchor.height,
            }}
          />
        </Popover.Anchor>
        <Popover.Content
          side="top"
          align="start"
          sideOffset={6}
          collisionPadding={8}
          className="w-auto border-0 bg-transparent p-0 shadow-none"
          data-agent-selection-ignore=""
          onOpenAutoFocus={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => event.preventDefault()}
          onPointerDownOutside={(event) => {
            if (
              event.target instanceof Node &&
              containerRef.current?.contains(event.target)
            )
              event.preventDefault();
          }}
        >
          <span role="status" className="sr-only">
            {loading
              ? t('mention-searching', 'Searching…')
              : t('mention-suggestions', {
                  count: options.length,
                  defaultValue: '{{count}} suggestions',
                })}
          </span>
          <SuggestionMenu
            id={listboxId}
            role="listbox"
            aria-label={t('mention-menu', 'Mention a record')}
            className="hide-scroll styled-scroll *:hide-scroll *:styled-scroll max-h-80"
          >
            {placeholder || !options.length ? (
              <div className="p-2 text-muted-foreground italic cursor-default">
                {placeholder ?? emptyText}
              </div>
            ) : (
              groups.map((group) => {
                const target = AGENT_REFERENCE_TARGETS[group.type];
                const Icon = target.icon;
                const headingId = `${listboxId}-${group.type}`;
                return (
                  <div
                    key={group.type}
                    role="group"
                    aria-labelledby={headingId}
                    className="flex flex-col gap-1"
                  >
                    <div
                      id={headingId}
                      className="flex items-center gap-1.5 px-2 pt-1 text-[11px] font-medium text-muted-foreground"
                    >
                      <Icon className="size-3.5" />
                      {t(
                        `mention-groups.${group.type}`,
                        GROUP_LABELS[group.type],
                      )}
                    </div>
                    {group.options.map((option) => {
                      position += 1;
                      const optionIndex = position;
                      const enabled = pickable(option);
                      return (
                        <SuggestionMenuItem
                          key={optionId(listboxId, option)}
                          id={optionId(listboxId, option)}
                          role="option"
                          aria-selected={optionIndex === index}
                          aria-disabled={!enabled || undefined}
                          isSelected={optionIndex === index}
                          className={cn(
                            'justify-start gap-2',
                            !enabled && 'opacity-50',
                          )}
                          onMouseEnter={() =>
                            setSelection({ key: queryKey, index: optionIndex })
                          }
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            if (enabled) onPick(option.mention);
                          }}
                        >
                          {option.avatar ? (
                            // skipcq: JS-W1015
                            <img
                              src={readImage(option.avatar)}
                              alt=""
                              className="size-5 shrink-0 rounded-full object-cover"
                            />
                          ) : (
                            <span
                              className={cn(
                                'size-5 shrink-0 rounded-full bg-primary/10 text-primary',
                                'text-xs flex items-center justify-center',
                              )}
                            >
                              {option.mention.label.charAt(0).toUpperCase()}
                            </span>
                          )}
                          <span className="truncate">
                            @{option.mention.label}
                          </span>
                          {option.description && (
                            <span className="ml-auto min-w-0 truncate pl-2 text-xs font-normal text-muted-foreground">
                              {option.description}
                            </span>
                          )}
                        </SuggestionMenuItem>
                      );
                    })}
                  </div>
                );
              })
            )}
            {statusNote && (
              <div className="px-2 py-1.5 border-t text-xs text-muted-foreground">
                {statusNote}
              </div>
            )}
          </SuggestionMenu>
        </Popover.Content>
      </Popover>
    );
  },
);
AgentMentionPopup.displayName = 'AgentMentionPopup';
