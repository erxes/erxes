import { toast } from 'erxes-ui';
import { useState } from 'react';
import { useLogs } from './useLogs';

export const useLogsRefetch = () => {
  const { refetch } = useLogs();
  const [refetching, setRefetching] = useState(false);

  const handleRefetch = async () => {
    setRefetching(true);
    try {
      await refetch();
    } catch (error) {
      toast({
        title: 'Failed to reload logs',
        description: error instanceof Error ? error.message : undefined,
        variant: 'destructive',
      });
    } finally {
      setRefetching(false);
    }
  };

  return { refetching, handleRefetch };
};
