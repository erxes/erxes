import { IconRefresh } from '@tabler/icons-react';
import { Button, Spinner } from 'erxes-ui';
import { useLogsRefetch } from '../hooks/useLogsRefetch';

export const LogsRefetchButton = () => {
  const { refetching, handleRefetch } = useLogsRefetch();

  return (
    <Button variant="ghost" disabled={refetching} onClick={handleRefetch}>
      {refetching ? <Spinner size="sm" /> : <IconRefresh />}
      Reload
    </Button>
  );
};
