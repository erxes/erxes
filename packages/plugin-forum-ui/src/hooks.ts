import { useLocation, useHistory } from 'react-router-dom';

export function useSearchParam(
  name: string
): [string | null, (v: string | null) => void] {
  const history = useHistory();
  const { search } = useLocation();
  const url = new URLSearchParams(search);

  const value = url.get(name);

  const setValue = (val: string | null) => {
    if (!val) {
      url.delete(name);
    } else {
      url.set(name, val);
    }
    history.replace({
      search: url.toString()
    });
  };

  return [value, setValue];
}
