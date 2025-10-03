import { useSearchParams } from 'react-router-dom';

export const useSidebarMode = (): [
  string | null,
  (mode: string | null) => void,
] => {
  const [searchParams, setSearchParams] = useSearchParams();

  const setSidebarMode = (mode: string | null) => {
    if (mode) {
      searchParams.set('sidebar', mode);
    } else {
      searchParams.delete('sidebar');
    }
    setSearchParams(searchParams);
  };

  return [searchParams.get('sidebar'), setSidebarMode];
};
