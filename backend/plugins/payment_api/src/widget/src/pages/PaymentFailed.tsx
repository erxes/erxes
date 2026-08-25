import { useQuery } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { INVOICE } from '../lib/graphql';

const PaymentFailed = () => {
  const { id } = useParams<{ id: string }>();

  const { data, loading } = useQuery(INVOICE, {
    variables: { id },
    skip: !id,
  });

  const redirectUri = data?.invoiceDetail?.redirectUri;

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <h1 className="mb-3 text-2xl font-semibold">
          Төлбөр амжилтгүй боллоо
        </h1>

        <p className="mb-6 text-sm text-muted-foreground">
          Таны төлбөрийг амжилттай боловсруулж чадсангүй.
        </p>

        <Button
          asChild
          className="w-full"
          disabled={loading || !redirectUri}
        >
          <a href={redirectUri || '/'}>Нүүр хуудас руу буцах</a>
        </Button>
      </div>
    </div>
  );
};

export default PaymentFailed;