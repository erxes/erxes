import { useState, ChangeEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';

import { Button } from 'erxes-ui';
import { IExchangeRate } from '../types';

type Props = {
  rateList: IExchangeRate[];
  totalCount: number;
  loading: boolean;
  deleteExchangeRates: (ids: string[], cb: () => void) => void;
  queryParams: Record<string, string>;
};

const ExchangeRates = ({
  rateList,
  totalCount,
  loading,
  deleteExchangeRates,
  queryParams,
}: Props) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchValue, setSearchValue] = useState(
    queryParams.searchValue ?? '',
  );

  /* ---------------- search ---------------- */

  const onSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);

    const params = new URLSearchParams(location.search);
    params.set('searchValue', value);

    navigate(`${location.pathname}?${params.toString()}`);
  };

  /* ---------------- actions ---------------- */

  const goCreate = () => {
    navigate('/settings/mongolian/exchange-rates/');
  };

  const goEdit = (id: string) => {
    navigate(`/settings/mongolian/exchange-rates//${id}`);
  };

  const remove = (id: string) => {
    deleteExchangeRates([id], () => {});
  };

  /* ---------------- render ---------------- */

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Exchange Rates ({totalCount})
        </h2>

        <div className="flex gap-2">
          {/* If Input does NOT exist in erxes-ui,
              replace this with <input /> */}
          <input
  className="h-8 rounded border px-2 text-sm"
  placeholder="Type to search"
  value={searchValue}
  onChange={onSearch}
/>


          <Button onClick={goCreate}>
            Add Exchange Rate
          </Button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="w-full border-collapse">
  <thead>
    <tr className="border-b">
      <th>Date</th>
      <th>Main Currency</th>
      <th>Rate Currency</th>
      <th>Rate</th>
      <th />
    </tr>
  </thead>
  <tbody>
    {rateList.map((rate) => (
      <tr key={rate._id} className="border-b">
        <td>{dayjs(rate.date).format('YYYY-MM-DD')}</td>
        <td>{rate.mainCurrency}</td>
        <td>{rate.rateCurrency}</td>
        <td>{rate.rate}</td>
        <td className="flex gap-2">
          <Button variant="ghost" onClick={() => goEdit(rate._id!)}>
            Edit
          </Button>
          <Button variant="ghost" onClick={() => remove(rate._id!)}>
            Delete
          </Button>
        </td>
      </tr>
    ))}
  </tbody>
</table>

      )}
    </div>
  );
};

export default ExchangeRates;
