import { useQuery } from '@apollo/client';
import { useEffect, useState } from 'react';
import { GET_EXPORT_HEADERS } from '../../graphql/export/exportQueries';
import { TExportHeader } from '../../types/export/exportTypes';

export const useExportFieldSelection = ({
  entityType,
  onConfirm,
  onOpenChange,
}: {
  entityType: string;
  onConfirm: (selectedFields: string[]) => void;
  onOpenChange: (open: boolean) => void;
}) => {
  const { data, loading } = useQuery(GET_EXPORT_HEADERS, {
    variables: { entityType },
    skip: !open,
  });

  const headers: TExportHeader[] = data?.exportHeaders || [];
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  // Initialize with default fields
  useEffect(() => {
    if (headers.length > 0 && selectedFields.length === 0) {
      const defaultFields = headers
        .filter((h) => h.isDefault)
        .map((h) => h.key);
      setSelectedFields(defaultFields);
    }
  }, [headers, selectedFields.length]);

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
    if (selectedFields.length === 0) {
      // If nothing selected, use defaults
      const defaultFields = headers
        .filter((h) => h.isDefault)
        .map((h) => h.key);
      onConfirm(defaultFields);
    } else {
      onConfirm(selectedFields);
    }
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
