import { Button } from 'erxes-ui';
import { IconArchive } from '@tabler/icons-react';
import { useSearchParams } from 'react-router-dom';

export default function ArchivedDeals() {
  const [searchParams, setSearchParams] = useSearchParams();
  const archivedOnly = searchParams.get('archivedOnly') === 'true';

  // Count archived deals

  const toggleArchived = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (archivedOnly) {
      params.delete('archivedOnly');
      params.delete('activeOnly');
    } else {
      params.set('archivedOnly', 'true');
      params.set('activeOnly', 'true');
    }
    setSearchParams(params, { replace: true });
  };

  return (
    <Button
      variant={archivedOnly ? 'secondary' : 'ghost'}
      onClick={toggleArchived}
      className="gap-2"
    >
      <IconArchive size={18} />
      {archivedOnly ? 'Show Active Items' : 'Show Archived Items'}
    </Button>
  );
}
