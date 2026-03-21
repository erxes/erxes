import { usePayment } from "../../hooks/use-payment";

const Minupay = () => {
  const { transaction, apiResponse } = usePayment();
  if (!transaction) {
    return null;
  }

  return (
    <div className="aspect-square">

      <iframe
        src={apiResponse}
        className="w-full h-full border-none rounded-lg mb-2"
      />
 
    </div>
  );
};

export default Minupay;
