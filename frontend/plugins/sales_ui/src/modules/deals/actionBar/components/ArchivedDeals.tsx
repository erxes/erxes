import { Button } from 'erxes-ui';
import { IconArchive } from '@tabler/icons-react';
import { useSearchParams } from 'react-router-dom';

export default function ArchivedDeals() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isArchivedMode = searchParams.get('archivedOnly') === 'true';

  const handleToggle = () => {
    const params = new URLSearchParams(searchParams);

    if (isArchivedMode) {
      params.delete('archivedOnly');
    } else {
      params.set('archivedOnly', 'true');
    }

    setSearchParams(params, { replace: true });
  };

  return (
    <Button
      variant={isArchivedMode ? 'secondary' : 'ghost'}
      onClick={handleToggle}
      className="gap-2"
    >
      <IconArchive size={18} />
      {isArchivedMode ? 'Show Active Items' : 'Show Archived Items'}
    </Button>
  );
}
