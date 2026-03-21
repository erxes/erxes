import Widgets from './Widgets';
import { PaymentContext } from './hooks/use-payment';

const App = () => {
  const params = new URLSearchParams(window.location.search);

  const paymentId = params.get('paymentId') || '';
  const kind = params.get('kind') || 'stripe';

  const value = {
    invoiceDetail: {} as any,
    payments: [],
    apiDomain: '',
    newTransaction: {} as any,
    requestNewTransaction: () => {},
    checkInvoiceHandler: () => {},

    isOpen: true,
    onClose: () => {},
    transaction: {} as any,

    kind,
    paymentId, 
    apiResponse: {
      clientSecret: 'test_secret',
    },
  };

  return (
    <PaymentContext.Provider value={value}>
      <Widgets />
    </PaymentContext.Provider>
  );
};

export default App;