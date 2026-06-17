import { IconSearch } from '@tabler/icons-react';

export const SearchArticlesInput = () => {
  return (
    <label
      htmlFor="search"
      className="rounded-xl bg-muted text-foreground w-full py-2.5 px-3 flex items-center mt-4"
    >
      <IconSearch className="size-4.5 text-accent-foreground" />
      <input
        placeholder="Search for help"
        id="search"
        className="bg-transparent text-foreground placeholder:text-foreground p-0 m-0 text-xs leading-none focus-visible:outline-none focus-visible:border-none focus-visible:ring-0 ps-4"
      />
    </label>
  );
};
