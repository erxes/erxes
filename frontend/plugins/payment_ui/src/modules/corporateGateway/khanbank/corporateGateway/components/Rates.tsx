import { Card } from 'erxes-ui/components/card';
import { IRate } from '../../../types';

type Props = {
  rates: IRate[];
};

const List = ({ rates }: Props) => {
  const filteredRates = rates.filter((rate) => rate.currency !== 'MNT');

  if (filteredRates.length === 0) {
    return (
      <Card className="p-6 text-center text-sm text-muted-foreground">
        No exchange rates available.
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr className="text-left">
              <th className="py-2">Currency</th>
              <th className="py-2">Buy</th>
              <th className="py-2">Sell</th>
            </tr>
          </thead>

          <tbody>
            {filteredRates.map((rate) => (
              <tr key={rate.number} className="border-b last:border-0">
                <td className="py-2 font-medium">{rate.currency}</td>
                <td className="py-2">{rate.buyRate.toLocaleString()}</td>
                <td className="py-2">{rate.sellRate.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default List;
