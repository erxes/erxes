import { Button } from '../components/ui/button';

const PaymentFailed = () => {
  const handleBack = () => {
    window.location.href = '/';
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <h1 className="mb-3 text-2xl font-semibold">Төлбөр амжилтгүй боллоо</h1>

        <p className="mb-6 text-sm text-muted-foreground">
          Таны төлбөрийг амжилттай боловсруулж чадсангүй.
        </p>

        <Button onClick={handleBack} className="w-full">
          Нүүр хуудас руу буцах
        </Button>
      </div>
    </div>
  );
};

export default PaymentFailed;
