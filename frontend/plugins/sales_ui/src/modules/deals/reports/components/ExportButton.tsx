import React, { useState } from 'react';
import { useLazyQuery } from '@apollo/client';
import { EXPORT_DEAL_REPORT } from '../graphql/queries/queries';
import { Button } from 'erxes-ui';

interface Props {
  chartType: string;
  filters: any;
  format?: 'csv';
  children?: React.ReactNode;
}

export const ExportButton: React.FC<Props> = ({ chartType, filters, format = 'csv', children }) => {
  const [exportReport, { loading }] = useLazyQuery(EXPORT_DEAL_REPORT);

  const handleExport = async () => {
    const res = await exportReport({
      variables: { chartType, filters, format },
    });
    const { success, content, filename } = res.data?.exportDealReport || {};
    if (success && content) {
      const blob = new Blob([content], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'report.csv';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Button onClick={handleExport} disabled={loading}>
      {children || 'Export CSV'}
    </Button>
  );
};