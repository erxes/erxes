import { useMemo, useRef, useState } from 'react';
import {
  DEFAULT_ENABLED_SUGGESTIONS,
  EnabledSuggestions,
  SUGGESTION_GROUPS,
  SuggestionType,
  SuggestionConfig,
  buildSuggestionMaps,
} from '../constants';

type PlaceholderInputProps = {
  // New dynamic configuration: supply explicit per-type enables
  enabled?: EnabledSuggestions;
  // Optional suggestionGroups to toggle in bulk: e.g., ['common'], ['calls'], ['all']
  suggestionGroups?: string[];
  // Backward-compat toggles; prefer using `enabled` or `suggestionGroups`
  enableAll?: boolean;
  disableAll?: boolean;
  ref: React.ForwardedRef<HTMLInputElement | HTMLTextAreaElement>;
  onChangeInputMode?: (mode: 'expression' | 'fixed') => void;
  // selection-only controls
  selectionMode?: 'single' | 'multi';
  selectionPolicy?: 'single' | 'multi'; // alias for clarity
  selectionType?: SuggestionType;
  forcedSuggestionType?: SuggestionType; // alias for clarity
  value?: string;
  onChange?: (value: string) => void;
  // Dynamic suggestion configs: add or override trigger/type/format/renderer
  extraSuggestionConfigs?: SuggestionConfig[];
  // Custom renderers per type when renderer === 'custom'
  customRenderers?: Partial<Record<SuggestionType, React.ComponentType<any>>>;
};

export const usePlaceHolderInput = ({
  enabled,
  suggestionGroups,
  enableAll = false,
  disableAll = false,
  ref,
  onChangeInputMode,
  selectionMode,
  selectionPolicy,
  selectionType,
  forcedSuggestionType,
  value = '',
  onChange,
  extraSuggestionConfigs = [],
  customRenderers,
}: PlaceholderInputProps) => {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const [inputMode, setInputMode] = useState<'expression' | 'fixed'>('fixed');
  const [isSelectionPopoverOpen, setIsSelectionPopoverOpen] =
    useState<boolean>(false);
  const suggestionPopoverRef = useRef<HTMLDivElement | null>(null);

  // Create enabled types mapping in a dynamic, composable way
  const enabledTypes = useMemo(() => {
    // Start from defaults
    const base: Record<SuggestionType, boolean> = {
      attribute: !!DEFAULT_ENABLED_SUGGESTIONS.attribute,
      emoji: !!DEFAULT_ENABLED_SUGGESTIONS.emoji,
      date: !!DEFAULT_ENABLED_SUGGESTIONS.date,
      option: !!DEFAULT_ENABLED_SUGGESTIONS.option,
      command: !!DEFAULT_ENABLED_SUGGESTIONS.command,
      call_user: !!DEFAULT_ENABLED_SUGGESTIONS.call_user,
      call_tag: !!DEFAULT_ENABLED_SUGGESTIONS.call_tag,
      call_product: !!DEFAULT_ENABLED_SUGGESTIONS.call_product,
      call_company: !!DEFAULT_ENABLED_SUGGESTIONS.call_company,
      call_customer: !!DEFAULT_ENABLED_SUGGESTIONS.call_customer,

      ...(customRenderers
        ? Object.keys(customRenderers).reduce((acc, key) => {
            acc[key as SuggestionType] = true;
            return acc;
          }, {} as Record<SuggestionType, boolean>)
        : {}),
    };

    if (enableAll) {
      Object.keys(base).forEach((key) => {
        base[key as SuggestionType] = true;
      });
    } else if (disableAll) {
      Object.keys(base).forEach((key) => {
        base[key as SuggestionType] = false;
      });
    }

    if (suggestionGroups && suggestionGroups.length) {
      suggestionGroups.forEach((groupName) => {
        const types = SUGGESTION_GROUPS[groupName];
        if (types && types.length) {
          types.forEach((t) => {
            base[t] = true;
          });
        }
      });
    }

    if (enabled) {
      Object.entries(enabled).forEach(([t, isOn]) => {
        base[t as SuggestionType] = !!isOn;
      });
    }

    return base;
  }, [enabled, suggestionGroups, enableAll, disableAll]);

  // Build dynamic suggestion maps by merging defaults with extras
  const {
    configs: suggestionConfigs,
    triggerToType,
    typeToTitle,
    typeToFormat,
    typeToRenderer,
  } = useMemo(
    () => buildSuggestionMaps(extraSuggestionConfigs),
    [extraSuggestionConfigs],
  );

  const setInputRef = (node: HTMLInputElement | HTMLTextAreaElement | null) => {
    (
      inputRef as React.MutableRefObject<
        HTMLInputElement | HTMLTextAreaElement | null
      >
    ).current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      (
        ref as React.MutableRefObject<
          HTMLInputElement | HTMLTextAreaElement | null
        >
      ).current = node;
    }
  };

  const handleInputModeChange = (mode: 'expression' | 'fixed') => {
    setInputMode(mode);
    if (onChangeInputMode) {
      onChangeInputMode(mode);
    }
  };

  // selection-only helpers
  const isSelectionOnlyMode = !!(selectionMode || selectionPolicy);

  const handleInputValueChange = (next: string) => {
    if (isSelectionOnlyMode) return;
    onChange && onChange(next);
  };

  const handleInputFocus = () => {
    if (isSelectionOnlyMode) setIsSelectionPopoverOpen(true);
  };

  const handleInputBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const nextTarget = e.relatedTarget as Node | null;
    const container = suggestionPopoverRef.current;
    if (container && nextTarget && container.contains(nextTarget)) {
      return;
    }
    setIsSelectionPopoverOpen(false);
  };

  const handleSelectionOnlyKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (!isSelectionOnlyMode) return;
    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      const current = value || '';
      if (!current.trim()) return onChange && onChange('');
      const policy = selectionMode || selectionPolicy;
      if (policy === 'single') return onChange && onChange('');
      const parts = current
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p.length > 0);
      parts.pop();
      const next = parts.length ? parts.join(', ') + ', ' : '';
      onChange && onChange(next);
      setIsSelectionPopoverOpen(true);
    }
  };

  return {
    inputRef,
    inputMode,
    enabledTypes,
    suggestionConfigs,
    triggerToType,
    typeToTitle,
    typeToFormat,
    typeToRenderer,
    customRenderers,
    isSelectionOnlyMode,
    isSelectionPopoverOpen,
    setIsSelectionPopoverOpen,
    setInputMode,
    setInputRef,
    handleInputModeChange,
    // selection-only api
    selectionMode,
    selectionPolicy,
    selectionType: forcedSuggestionType || selectionType,
    handleInputValueChange,
    handleInputFocus,
    handleInputBlur,
    handleSelectionOnlyKeyPress,
    suggestionPopoverRef,
  };
};
