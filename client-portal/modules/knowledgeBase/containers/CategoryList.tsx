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
    $selectedPaymentId: String
    $phone: String
    $email: String
    $description: String
    $customerId: String
    $customerType: String
    $contentType: String
    $contentTypeId: String
    $couponCode: String
    $couponAmount: Int
    $data: JSON
  ) {
    invoiceCreate(
      amount: $amount
      selectedPaymentId: $selectedPaymentId
      phone: $phone
      email: $email
      description: $description
      customerId: $customerId
      customerType: $customerType
      contentType: $contentType
      contentTypeId: $contentTypeId
      couponCode: $couponCode
      couponAmount: $couponAmount
      data: $data
    ) {
      _id
      apiResponse
      idOfProvider
      errorDescription
      paymentKind
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

  return (
    <>
      {/* <Layout
        headerBottomComponent={<Search searchValue={searchValue} />}
        headingSpacing={true}
      >
        {(props: Store) => renderContent(props)}
      </Layout> */}

      <button
        onClick={() => {
          invoiceCreate({
            variables: {
              amount: 1000,
              phone: '12345678',
            },
          }).then((res) => {
            const inv = res.data.invoiceCreate;

            console.log('inv', inv);
            // load payment url in iframe

            const headers = {
              Accept: 'application/json',
              'Content-Type': 'application/json',
              'erxes-app-token': NEXT_PUBLIC_ERXES_APP_TOKEN,
            };

            const url = `http://localhost:4000/pl:payment/invoice/${inv._id}`;

            console.log('url', url);

            // node-fetch
            fetch(url, {
              headers,
            })
              .then((ress) => ress.blob())
              .then((data) => {
                console.log('data', data);
                const iframe: any = document.getElementById('docIframe');
                const dataUrl = URL.createObjectURL(data);

                iframe.src = dataUrl;
              });
          });
        }}
      >
        Click me
      </button>

      <iframe id="docIframe" width='100%' height={'1000px'} />
    </>
  );
}

export default CategoriesContainer;
