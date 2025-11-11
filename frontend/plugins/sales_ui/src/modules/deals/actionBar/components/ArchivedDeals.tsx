import { Button } from 'erxes-ui';
import { IconArchive } from '@tabler/icons-react';
import { useSearchParams } from 'react-router-dom';

export default function ArchivedDeals() {
  const [searchParams, setSearchParams] = useSearchParams();
  const archivedOnly = searchParams.get('archivedOnly') === 'true';

  const toggleArchived = () => {
    const next = new URLSearchParams(searchParams.toString());
    if (archivedOnly) {
      next.delete('archivedOnly');
      next.delete('noSkipArchive');
    } else {
      next.set('archivedOnly', 'true');
      next.set('noSkipArchive', 'true');
    }
    setSearchParams(next, { replace: true });
  };

  return (
    <Button
      variant={archivedOnly ? 'secondary' : 'ghost'}
      onClick={toggleArchived}
    >
      <IconArchive />
      {archivedOnly ? 'Active items' : 'Archived items'}
    </Button>
  );
}
