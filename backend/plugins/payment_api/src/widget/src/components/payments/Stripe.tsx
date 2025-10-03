import { gql, useQuery } from '@apollo/client';
import {
  CardElement,
  Elements,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { usePayment } from '../../hooks/use-payment';
import { Button } from '../ui/button';


const QUERY = gql`
  query Query($id: String!) {
    paymentsGetStripeKey(_id: $id)
  }
`;

// Create a separate component for the payment form that will be rendered inside <Elements>
const CheckoutForm = () => {
  const { apiResponse } = usePayment();
  const clientSecret = apiResponse?.clientSecret;
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Check if stripe or elements are null
    if (!stripe || !elements) {
      console.error('Stripe or elements is not loaded');
      return;
    }

    // Get the card element from elements
    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      console.error('Card element not found');
      return;
    }

    // Confirm the card payment with Stripe
    const { error } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });

    if (error) {
      console.error('Payment error:', error);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '18px', // Increase font size
                color: '#424770',
                letterSpacing: '0.025em',
                fontFamily: 'Source Code Pro, monospace',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />

        <Button
          className='w-full mb-2'
          type='submit'
          style={{ marginTop: '50px' }}
        >
          Pay
        </Button>
      </form>
    </>
  );
};

const StripePayment = () => {
  const { paymentId } = usePayment();
  // Initialize the stripePromise using the publishable key
  const { data, loading } = useQuery(QUERY, {
    variables: { id: paymentId },
  });

  if (loading) {
    return null;
  }

  if (!data?.paymentsGetStripeKey) {
    return null;
  }

  const publishableKey = data?.paymentsGetStripeKey;

  const stripePromise = loadStripe(publishableKey);

  return (
    <div className='h-auto'>
      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </div>
  );
};

export default StripePayment;
