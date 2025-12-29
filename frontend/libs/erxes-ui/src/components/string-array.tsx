'use client';

import { type Tag, TagInput } from 'emblor';
import { cn } from 'erxes-ui/lib';
import { useState } from 'react';

export function StringArrayInput({
  value,
  onValueChange,
  id,
  placeholder,
  styleClasses,
  onBlur,
}: {
  value: string[];
  onValueChange: (value: string[]) => void;
  id?: string;
  placeholder?: string;
  styleClasses?: {
    inlineTagsContainer?: string;
    input?: string;
    tag?: {
      body?: string;
      closeButton?: string;
    };
  };
  onBlur?: () => void;
}) {
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);
  return (
    <TagInput
      activeTagIndex={activeTagIndex}
      placeholder={placeholder || 'Add a tag'}
      setActiveTagIndex={setActiveTagIndex}
      id={id}
      setTags={(newTags) => {
        onValueChange((newTags as Tag[]).map((tag) => tag.text as string));
      }}
      styleClasses={{
        inlineTagsContainer: cn(
          'rounded bg-background border-none transition-[color,box-shadow] focus-within:shadow-focus outline-none h-8 p-0 px-1 gap-1',
          styleClasses?.inlineTagsContainer,
        ),
        input: cn(
          'w-full min-w-[80px] shadow-none px-2 h-7',
          styleClasses?.input,
        ),
        tag: {
          body: cn(
            'h-6 relative bg-background border border-input hover:bg-background rounded-md font-medium text-xs ps-2 pe-5',
            styleClasses?.tag?.body,
          ),
          closeButton: cn(
            'absolute -inset-y-px -end-px p-0 rounded-e-md flex size-6 transition-[color,box-shadow] outline-none text-muted-foreground/80 hover:text-foreground',
            styleClasses?.tag?.closeButton,
          ),
        },
      }}
      tags={value.map((tag) => ({ id: tag, text: tag }))}
      onBlur={onBlur}
    />
  );
}
