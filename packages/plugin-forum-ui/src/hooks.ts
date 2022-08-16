import { useLocation, useHistory } from 'react-router-dom';

// export function useUrl(param: string) {
//   const history = useHistory();
//   const { search, pathname } = useLocation();
//   const url = new URLSearchParams(search);

//   const urlParam = url.get(param);
//   const [value, _setValue] = useState(urlParam !== null ? urlParam : '');

//   function setValue(val: string) {
//     url.set(param, val);
//     history.replace({
//       // pathname,
//       search: url.toString(),
//     });
//     _setValue(val);
//   }

//   return [value, setValue];
// }

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
