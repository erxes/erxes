import { useQuery } from '@apollo/client';
import { useEffect, useRef, useState } from 'react';
import { GET_EXPORT_HEADERS } from '../../graphql/export/exportQueries';
import { TExportHeader } from '../../types/export/exportTypes';

export const useExportFieldSelection = ({
  entityType,
  filters,
  open,
  onConfirm,
  onOpenChange,
}: {
  entityType: string;
  filters?: Record<string, any>;
  open: boolean;
  onConfirm: (selectedFields: string[]) => void;
  onOpenChange: (open: boolean) => void;
}) => {
  const { data, loading } = useQuery(GET_EXPORT_HEADERS, {
    variables: { entityType, ...(filters ? { filters } : {}) },
    skip: !open,
  });

  const headers: TExportHeader[] = data?.exportHeaders || [];
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const initializedRef = useRef(false);

  // Seed the defaults once; an empty selection afterwards is the user's choice
  useEffect(() => {
    if (!headers.length || initializedRef.current) {
      return;
    }

    initializedRef.current = true;
    setSelectedFields(headers.filter((h) => h.isDefault).map((h) => h.key));
  }, [headers]);

  const handleToggleField = (key: string) => {
    setSelectedFields((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const handleSelectAll = () => {
    const allKeys = headers.map((h) => h.key);
    setSelectedFields(allKeys);
  };

  const handleDeselectAll = () => {
    setSelectedFields([]);
  };

  const handleSelectDefaults = () => {
    const defaultFields = headers.filter((h) => h.isDefault).map((h) => h.key);
    setSelectedFields(defaultFields);
  };

  const handleConfirm = () => {
    if (!selectedFields.length) {
      return;
    }

    onConfirm(selectedFields);
    onOpenChange(false);
  };

  return {
    selectedFields,
    headers,
    loading,
    handleConfirm,
    handleDeselectAll,
    handleSelectAll,
    handleSelectDefaults,
    handleToggleField,
  };
};
