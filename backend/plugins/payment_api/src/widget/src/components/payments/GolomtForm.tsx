import { usePayment } from '../../hooks/use-payment';

const Golomt = () => {
  const { transaction, apiResponse } = usePayment();
  if (!transaction) {
    return null;
  }

  return (
    <div className="aspect-square">
      <iframe
        src={`https://ecommerce.golomtbank.com/payment/mn/${apiResponse.invoice}`}
        className="w-full h-full border-none rounded-lg mb-2"
      />
    </div>
  );
};

export default Golomt;
