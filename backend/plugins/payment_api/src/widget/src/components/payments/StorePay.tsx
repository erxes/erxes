import React from 'react';
import { Button } from '../ui/button';
import { LoaderIcon } from '../Loader';
import { usePayment } from '../../hooks/use-payment';
import Phone from '../Phone';


const PhonePayment = () => {
  const [phone, setPhone] = React.useState('');

  const {
    kind,
    requestNewTransaction,
    paymentId,
    transactionLoading,
    apiResponse
  } = usePayment();

  if (kind !== 'storepay') return null;

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        requestNewTransaction(paymentId, { phone });
      }}
    >
      <div className="py-12 text-center">
        <div className="inline-flex text-left flex-col gap-1">
          <label htmlFor="phone" className="text-sm inline-block ">
            Phone Number
          </label>
          <Phone id={'phone'} handleOutputString={setPhone} />
        </div>
      </div>
  
        {apiResponse?.message || apiResponse?.error || (
          <p className="text-sm text-neutral-500">
            Та Storepay-д бүртгэлтэй утасны дугаараа оруулан хүсэлт илгээн
            үүссэн нэхэмжлэхийн дагуу худалдан авалтаа баталгаажуулснаар бараа
            бүтээгдэхүүн, үйлчилгээгээ авах боломжтой.
          </p>
        )}

      <div className="sticky -bottom-4 bg-white -mx-4 px-4 pb-4 mt-4 -mb-4">
        <Button className="w-full mb-2" disabled={transactionLoading}>
          {transactionLoading && <LoaderIcon className="mr-2" />}
          Send Request
        </Button>
      </div>
    </form>
  );
};

export default PhonePayment;
