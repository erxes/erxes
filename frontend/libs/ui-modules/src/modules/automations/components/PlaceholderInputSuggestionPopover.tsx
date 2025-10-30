import { Command } from 'erxes-ui';
import { useEffect, useRef, useState } from 'react';
import { DATE_OPTIONS, SuggestionType } from '../constants';
import { RenderAttributes, RenderOptions } from './Attributes';
import { EmojiPicker } from './EmojiPicker';

interface SuggestionPopoverProps {
  open: boolean;
  type: SuggestionType;
  searchQuery: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  anchorElement: HTMLElement | null;
  cursorPosition: number;
  contentType: string;
  attrConfig: any;
  customAttributions?: any[];
  selectedField?: any;
  popoverRef?: React.MutableRefObject<HTMLDivElement | null>;
  // Controls renderer per type; defaults to 'command'
  renderer?: 'command' | 'custom';
  // If renderer === 'custom', this component will be rendered
  customRenderer?: React.ComponentType<{
    searchQuery: string;
    onSelect: (value: string) => void;
    onClose: () => void;
  }>;
  // Dynamic maps (built upstream with extraSuggestionConfigs)
  typeToTitle: Record<SuggestionType, string>;
  typeToFormat: Record<SuggestionType, (value: string) => string>;
}

// Titles are provided by TYPE_TO_TITLE from constants

export function PlaceholderInputSuggestionPopover({
  open,
  type,
  searchQuery,
  onSelect,
  onClose,
  anchorElement,
  contentType,
  attrConfig,
  customAttributions,
  selectedField,
  popoverRef,
  renderer = 'command',
  customRenderer,
  typeToTitle,
  typeToFormat,
}: SuggestionPopoverProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const internalRef = useRef<HTMLDivElement>(null);

  // expose internal ref to parent when requested
  useEffect(() => {
    if (!popoverRef) return;
    popoverRef.current = internalRef.current;
  }, [popoverRef, open]);

  // Reset selected index when suggestions change
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery, type]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, onSelect, onClose]);

  if (!open) return null;

  if (type === 'emoji') {
    return (
      <EmojiPicker
        className="rounded-lg bg-background border max-h-80 shadow-lg mt-2 fixed z-50 w-80"
        onEmojiSelect={({ emoji }) => onSelect(emoji)}
      >
        <EmojiPicker.Search />
        <EmojiPicker.Content />
      </EmojiPicker>
    );
  }

  if (renderer === 'custom' && customRenderer) {
    const Custom = customRenderer;
    return (
      <div
        ref={internalRef}
        className="rounded-lg bg-background border max-h-80 shadow-lg mt-2 fixed z-50 w-80"
      >
        <Custom
          searchQuery={searchQuery}
          onSelect={onSelect}
          onClose={onClose}
        />
      </div>
    );
  }
  return (
    <Command
      ref={internalRef}
      className="rounded-lg border max-h-80 shadow-lg mt-2 fixed z-50 w-80"
    >
      <Command.Input placeholder={`Search ${typeToTitle[type]}...`} />
      <Command.List>
        <Command.Empty>Not found.</Command.Empty>
        {type === 'attribute' && (
          <RenderAttributes
            contentType={contentType}
            attrConfig={attrConfig}
            customAttributions={customAttributions}
            onSelect={(value) => onSelect(typeToFormat['attribute'](value))}
          />
        )}
        {type === 'option' && (
          <RenderOptions
            selectOptions={selectedField?.selectOptions || []}
            onSelect={(value) => onSelect(typeToFormat['option'](value))}
          />
        )}
        {type === 'date' && (
          <Command.Group value="date">
            {DATE_OPTIONS.map((option) => (
              <Command.Item
                key={option.id}
                value={option.value}
                onSelect={() => onSelect(typeToFormat['date'](option.value))}
              >
                {option.label}
              </Command.Item>
            ))}
          </Command.Group>
        )}
      </Command.List>
    </Command>
  );
}
