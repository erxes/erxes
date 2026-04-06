import { useQuery } from '@apollo/client';
import { CONTRACTS } from '../modules/insurance/graphql/queries';

export const Widgets = ({
  contentId,
}: {
  module: unknown;
  contentId: string;
  contentType: string;
}) => {
  const { data, loading } = useQuery(CONTRACTS, {
    variables: { customerId: contentId },
    skip: !contentId,
  });

  if (loading) {
    return <div className="p-4 text-sm text-gray-500">Ачааллаж байна...</div>;
  }

  const contracts = data?.contracts || [];

  if (contracts.length === 0) {
    return (
      <div className="p-4 text-sm text-gray-400">Даатгалын гэрээ байхгүй</div>
    );
  }

  return (
    <div className="p-4 space-y-2">
      <h3 className="text-sm font-semibold text-gray-700">
        Даатгалын гэрээнүүд ({contracts.length})
      </h3>
      {contracts.map((contract: { id: string; contractNumber: string; paymentStatus: string; chargedAmount: number }) => (
        <div
          key={contract.id}
          className="p-3 border rounded-lg text-sm space-y-1"
        >
          <div className="flex justify-between">
            <span className="font-medium">{contract.contractNumber}</span>
            <span
              className={`px-2 py-0.5 rounded text-xs ${
                contract.paymentStatus === 'paid'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {contract.paymentStatus === 'paid'
                ? 'Төлөгдсөн'
                : 'Хүлээгдэж буй'}
            </span>
          </div>
          <div className="text-gray-500">
            {contract.chargedAmount?.toLocaleString()}₮
          </div>
        </div>
      ))}
    </div>
  );
};

export default Widgets;
