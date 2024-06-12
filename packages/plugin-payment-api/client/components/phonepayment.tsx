import React from 'react';
import { usePayment } from './Payments';
import PhoneNumber from '../common/phonenumber';
import { Button } from '../common/button';
import { LoaderIcon } from '../common/Loader';
import CloseButton from './CloseButton';
import Alert from '../common/alert';

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
          <PhoneNumber id={'phone'} handleOutputString={setPhone} />
        </div>
      </div>
      <Alert>
        {apiResponse?.message || apiResponse?.error || (
          <>
            Та Storepay-д бүртгэлтэй утасны дугаараа оруулан хүсэлт илгээн
            үүссэн нэхэмжлэхийн дагуу худалдан авалтаа баталгаажуулснаар бараа
            бүтээгдэхүүн, үйлчилгээгээ авах боломжтой.
          </>
        )}
      </Alert>
      <div className="sticky -bottom-4 bg-white -mx-4 px-4 pb-4 mt-4 -mb-4">
        <Button className="w-full mb-2" disabled={transactionLoading}>
          {transactionLoading && <LoaderIcon className="mr-2" />}
          Send Request
        </Button>
        <CloseButton />
      </div>
    </form>
  );
};

export default PhonePayment;
