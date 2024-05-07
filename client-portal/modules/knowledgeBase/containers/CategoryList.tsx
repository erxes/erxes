import ArticleListContainer from './ArticleList';
import CategoryList from '../components/CategoryList';
import Layout from '../../main/containers/Layout';
import React from 'react';
import Search from '../../main/components/Search';
import { Store } from '../../types';
import { useRouter } from 'next/router';
import { gql, useMutation } from '@apollo/client';
import { getEnv } from '../../../utils/configs';

const MUTATION = gql`
  mutation InvoiceCreate(
    $amount: Float!
    $phone: String
    $email: String
    $description: String
    $customerId: String
    $customerType: String
    $contentType: String
    $contentTypeId: String
    $data: JSON
  ) {
    invoiceCreate(
      amount: $amount
      phone: $phone
      email: $email
      description: $description
      customerId: $customerId
      customerType: $customerType
      contentType: $contentType
      contentTypeId: $contentTypeId

      data: $data
    ) {
      _id
      status
      amount
    }
  }
`;

function CategoriesContainer() {
  const {
    REACT_APP_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHAiOnsiY3JlYXRlZEF0IjoiMjAyMy0xMi0yMVQwMDo1NDozNS44MDZaIiwibmFtZSI6InBvcyBwYXltZW50IiwidXNlckdyb3VwSWQiOiJuUmhodEdEVHN6OGRLdkpzOERyQ1UiLCJleHBpcmVEYXRlIjoiMjAyNC0wMS0yMFQwNTo1MDowMC43MDJaIiwiYWxsb3dBbGxQZXJtaXNzaW9uIjpmYWxzZSwibm9FeHBpcmUiOnRydWUsIl9pZCI6ImFMOTE2eEplekowM2hHQ2ZpeWwzYSIsIl9fdiI6MH0sImlhdCI6MTcwMzEzNzgwOX0.65yETqkDew7NWZRAIHOcpdmQnOzKhr9qy3ugrR8DH-Q'
  } = getEnv();

  console.log('REACT_APP_TOKEN', REACT_APP_TOKEN);

  const router = useRouter();

  if (typeof window !== 'undefined') {
    window.addEventListener('message', event => {
      const { fromPayment, message, invoice } = event.data;

      if (fromPayment) {
        if (message === 'paymentSuccessfull') {
          console.log('paymentSuccessfull', invoice);

          const pendingInvoices = sessionStorage.getItem('pendingInvoices');

          const parsed = pendingInvoices ? JSON.parse(pendingInvoices) : [];

          // remove invoice from pending invoices
          const filtered = parsed.filter(p => p._id !== invoice._id);

          sessionStorage.setItem('pendingInvoices', JSON.stringify(filtered));
        }
      }
    });
  }

  const { searchValue } = router.query;

  const [invoiceCreate] = useMutation(MUTATION);

  const renderContent = props => {
    if (searchValue) {
      return (
        <ArticleListContainer
          searchValue={searchValue}
          topicId={props.topic._id}
          config={props.config}
          currentUser={props.currentUser}
        />
      );
    }

    return <CategoryList {...props} />;
  };

  const createInvoice = () => {
    const contentTypeId = 'UcP4JRIJtbDDpjQvNzmgP';
    const pendingInvoices = sessionStorage.getItem('pendingInvoices');

    const parsed = pendingInvoices ? JSON.parse(pendingInvoices) : [];

    const previousInvoice = parsed.find(p => p.contentTypeId === contentTypeId);

    if (previousInvoice) {
      const url = `http://localhost:4000/pl:payment/invoice/${previousInvoice._id}`;
      const iframe: any = document.getElementById('docIframe');
      iframe.src = url;
      return;
    }

    invoiceCreate({
      variables: {
        amount: 1000,
        phone: '12345678',
        contentType: 'cards:deal',
        contentTypeId
      },
      context: {
        headers: {
          'erxes-app-token':
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHAiOnsiY3JlYXRlZEF0IjoiMjAyMy0xMi0yMVQwMDo1NDozNS44MDZaIiwibmFtZSI6InBvcyBwYXltZW50IiwidXNlckdyb3VwSWQiOiJuUmhodEdEVHN6OGRLdkpzOERyQ1UiLCJleHBpcmVEYXRlIjoiMjAyNC0wMS0yMFQwNTo1MDowMC43MDJaIiwiYWxsb3dBbGxQZXJtaXNzaW9uIjpmYWxzZSwibm9FeHBpcmUiOnRydWUsIl9pZCI6ImFMOTE2eEplekowM2hHQ2ZpeWwzYSIsIl9fdiI6MH0sImlhdCI6MTcwMzEzNzgwOX0.65yETqkDew7NWZRAIHOcpdmQnOzKhr9qy3ugrR8DH-Q'
        }
      }
    }).then(res => {
      const inv = res.data.invoiceCreate;

      const url = `http://localhost:4000/pl:payment/invoice/${inv._id}`;

      const pendingInvoice = {
        _id: inv._id,
        amount: inv.amount,
        status: inv.status,
        contentTypeId,
        contentType: 'cards:deal'
      };

      if (pendingInvoices) {
        parsed.push(pendingInvoice);

        sessionStorage.setItem('pendingInvoices', JSON.stringify(parsed));
      } else {
        sessionStorage.setItem(
          'pendingInvoices',
          JSON.stringify([pendingInvoice])
        );
      }

      console.log('url', url);

      const iframe: any = document.getElementById('docIframe');
      iframe.src = url;
    });
  };

  // center button and over iframe
  const style = {
    position: 'absolute',
    // top: '10%',
    left: '50%',
    transform: 'translate(-50%, -50%)'
  };

  return (
    <>
      <button
        style={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }}
        onClick={() => {
          createInvoice();
        }}
      >
        Pay now
      </button>

      <div>
        {/* <Layout
        headerBottomComponent={<Search searchValue={searchValue} />}
        headingSpacing={true}
      >
        {(props: Store) => renderContent(props)}
      </Layout> */}

        <iframe id="docIframe" width="100%" height={'1000px'} />
      </div>
    </>
  );
}

export default CategoriesContainer;
