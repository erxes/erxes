import ArticleListContainer from './ArticleList';
import CategoryList from '../components/CategoryList';
import Layout from '../../main/containers/Layout';
import React from 'react';
import Search from '../../main/components/Search';
import { Store } from '../../types';
import { useRouter } from 'next/router';
import { gql, useMutation } from '@apollo/client';

const NEXT_PUBLIC_ERXES_APP_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHAiOnsiY3JlYXRlZEF0IjoiMjAyNC0wMy0xM1QwMDoyNTozNy45MzBaIiwibmFtZSI6InBheW1lbnQiLCJ1c2VyR3JvdXBJZCI6ImNNbDBhUGNRNUFQTkQ5UTdjdkVpNiIsImV4cGlyZURhdGUiOiIyMDI0LTA0LTEyVDA1OjUzOjMyLjQxN1oiLCJhbGxvd0FsbFBlcm1pc3Npb24iOmZhbHNlLCJub0V4cGlyZSI6dHJ1ZSwiX2lkIjoiUkpVNGtJc3FoOFNnVWw0SjN4TTZhIiwiX192IjowfSwiaWF0IjoxNzEwMzA5MjIzfQ.cq8PXxhVZL3H0eHcL5H1hqbrcr1oSvN9t7RmLcS_aSQ';

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
  const router = useRouter();
  const { searchValue } = router.query;

  const [invoiceCreate] = useMutation(MUTATION);

  const renderContent = (props) => {
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

    const previousInvoice = parsed.find(
      (p) => p.contentTypeId === contentTypeId
    );

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
        contentTypeId,
      },
    }).then((res) => {
      const inv = res.data.invoiceCreate;

      const url = `http://localhost:4000/pl:payment/invoice/${inv._id}`;

      const pendingInvoice = {
        _id: inv._id,
        amount: inv.amount,
        status: inv.status,
        contentTypeId,
        contentType: 'cards:deal',
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
    transform: 'translate(-50%, -50%)',
  };

  return (
    <>
      <button
        style={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
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
