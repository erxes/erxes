import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { gql, useQuery } from '@apollo/client';
import { Combobox, Command, PopoverScoped } from 'erxes-ui';

const SEGMENTS_QUERY = gql`
  query segments($contentTypes: [String]!, $config: JSON) {
    segments(contentTypes: $contentTypes, config: $config) {
      _id
      name
      contentType
    }
  }
`;

type Segment = { _id: string; name: string; contentType: string };

interface SelectSegmentsContextType {
  value: string;
  onValueChange: (segmentId: string) => void;
  contentTypes: string[];
  loading?: boolean;
  error?: any;
  segments?: Segment[];
}

const SelectSegmentsContext = createContext<SelectSegmentsContextType | null>(
  null,
);

const useSelectSegmentsContext = () => {
  const context = useContext(SelectSegmentsContext);
  if (!context) {
    throw new Error(
      'useSelectSegmentsContext must be used within SelectSegmentsProvider',
    );
  }
  return context;
};

export const SelectSegmentsProvider = ({
  value,
  onValueChange,
  contentTypes,
  config,
  children,
}: {
  value: string;
  onValueChange: (segmentId: string) => void;
  contentTypes: string[];
  config?: any;
  children: React.ReactNode;
}) => {
  const { data, loading, error } = useQuery(SEGMENTS_QUERY, {
    variables: { contentTypes, config },
    skip: !contentTypes?.length,
  });

  const segments: Segment[] = useMemo(() => data?.segments || [], [data]);

  const contextValue = useMemo(
    () => ({
      value: value || '',
      onValueChange,
      contentTypes,
      segments,
      loading,
      error,
    }),
    [value, onValueChange, contentTypes, segments, loading, error],
  );

  return (
    <SelectSegmentsContext.Provider value={contextValue}>
      {children}
    </SelectSegmentsContext.Provider>
  );
};

const SelectSegmentsValue = ({ placeholder }: { placeholder?: string }) => {
  const { value, segments } = useSelectSegmentsContext();
  const selectedSegment = segments?.find((s) => s._id === value);

  if (!selectedSegment) {
    return (
      <span className="text-accent-foreground/80">
        {placeholder || 'Choose segment'}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <p className="font-medium text-sm">{selectedSegment.name}</p>
    </div>
  );
};

const SelectSegmentsItem = ({ segment }: { segment: Segment }) => {
  const { onValueChange, value } = useSelectSegmentsContext();

  return (
    <Command.Item
      value={segment._id}
      onSelect={() => {
        onValueChange(segment._id === value ? '' : segment._id);
      }}
    >
      <span className="font-medium">{segment.name}</span>
      <Combobox.Check checked={value === segment._id} />
    </Command.Item>
  );
};

const SelectSegmentsContent = () => {
  const { segments, loading, error, contentTypes } = useSelectSegmentsContext();

  const renderContent = () => {
    if (!contentTypes?.length) {
      return (
        <div className="flex items-center justify-center h-24">
          <span className="text-muted-foreground">No content types</span>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="flex items-center justify-center h-24">
          <span className="text-muted-foreground">Loading...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-24 text-destructive">
          Error: {error.message}
        </div>
      );
    }

    return segments?.map((s) => (
      <SelectSegmentsItem key={s._id} segment={s} />
    ));
  };

  return (
    <Command>
      <Command.Input placeholder="Search segment" />
      <Command.Empty>
        <span className="text-muted-foreground">No segments found</span>
      </Command.Empty>
      <Command.List>{renderContent()}</Command.List>
    </Command>
  );
};

const SelectSegmentsRoot = ({
  value,
  onValueChange,
  contentTypes,
  config,
  disabled,
}: {
  value: string;
  onValueChange: (segmentId: string) => void;
  contentTypes: string[];
  config?: any;
  disabled?: boolean;
}) => {
  const [open, setOpen] = React.useState(false);

  const handleValueChange = useCallback(
    (id: string) => {
      onValueChange(id);
      setOpen(false);
    },
    [onValueChange],
  );

  return (
    <SelectSegmentsProvider
      value={value}
      onValueChange={handleValueChange}
      contentTypes={contentTypes}
      config={config}
    >
      <PopoverScoped open={open} onOpenChange={setOpen}>
        <Combobox.Trigger disabled={disabled || !contentTypes?.length}>
          <SelectSegmentsValue />
        </Combobox.Trigger>
        <Combobox.Content>
          <SelectSegmentsContent />
        </Combobox.Content>
      </PopoverScoped>
    </SelectSegmentsProvider>
  );
};

export default SelectSegmentsRoot;
