import { Input, useMultiQueryState } from 'erxes-ui';
import { IconSearch } from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';

export const SalesSearch = () => {
  const [queries, setQueries] = useMultiQueryState<{ search: string }>([
    'search',
  ]);
  const [search, setSearch] = useState(queries.search || '');

  useEffect(() => {
    setSearch(queries.search || '');
  }, [queries.search]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setQueries({ search });
    }
  };

  const handleSearch = () => {
    setQueries({ search });
  };

  return (
    <div className="relative">
      <Input
        placeholder="Search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex items-center w-30 focus:w-60 transition-all duration-300 ease-in-out rounded-xl"
      />
      <button
        type="button"
        onClick={handleSearch}
        aria-label="Search"
        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
      >
        <IconSearch className="w-4 h-4" />
      </button>
    </div>
  );
};
