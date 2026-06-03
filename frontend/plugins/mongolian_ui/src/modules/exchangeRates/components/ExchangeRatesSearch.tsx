import { IconSearch } from '@tabler/icons-react';
import { Input, useQueryState } from 'erxes-ui';
import React, { useEffect, useState } from 'react';

export const ExchangeRatesSearch = () => {
  const [searchValue, setSearchValue] = useQueryState<string>('searchValue');
  const [search, setSearch] = useState(searchValue ?? '');

  useEffect(() => {
    setSearch(searchValue ?? '');
  }, [searchValue]);

  const handleSearch = () => setSearchValue(search.trim() || null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="relative">
      <Input
        placeholder="Search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex items-center w-40 focus:w-64 transition-all duration-300 ease-in-out rounded-xl pr-8"
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
