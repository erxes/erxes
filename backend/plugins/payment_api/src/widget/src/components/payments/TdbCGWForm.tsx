import { useEffect } from 'react';
import { usePayment } from '../../hooks/use-payment';

const TdbCGWForm = () => {
  const { apiResponse } = usePayment();

  useEffect(() => {
    const hppRedirectUrl = apiResponse?.hppRedirectUrl;

    if (hppRedirectUrl) {
      window.location.href = hppRedirectUrl;
    }
  }, [apiResponse]);

  return (
    <div className="p-4 text-center">
      <p>Redirecting to TDB payment...</p>
    </div>
  );
};

export default TdbCGWForm;