import { createRoot } from 'react-dom/client';
import App from './payment/App';
import { ApolloProvider } from '@apollo/client';
import { client } from './payment/lib/apollo-client';

type InitOptions = {
  invoiceId: string;
  kind?: string;
  paymentId?: string;
  containerId?: string;
};

const mount = (options: InitOptions) => {
  const {
    invoiceId,
    kind = 'qpay',
    paymentId = '',
    containerId = 'payment-widget-root',
  } = options;

  let container = document.getElementById(containerId);

  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    document.body.appendChild(container);
  }

  // inject params into URL (so your existing logic works)
  const url = new URL(window.location.href);
  url.searchParams.set('kind', kind);
  url.searchParams.set('paymentId', paymentId);
  window.history.replaceState({}, '', url.toString());

  // fake path for invoiceId
  window.history.replaceState(
    {},
    '',
    `/pl:payment/widget/invoice/${invoiceId}?${url.searchParams.toString()}`
  );

  const root = createRoot(container);

  root.render(
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  );
};

// 👇 THIS is the key
(window as any).PaymentWidget = {
  init: mount,
};