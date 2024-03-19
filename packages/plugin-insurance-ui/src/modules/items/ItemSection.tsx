import React from 'react';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client';
import Box from '@erxes/ui/src/components/Box';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Map from '@erxes/ui/src/containers/map/Map';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils/core';

const ITEM_QUERY = gql`
  query InsuranceItemByDealId($id: String!) {
    insuranceItemByDealId(_id: $id) {
      _id
      customFieldsData
      feePercent
      price
      product {
        _id
        category {
          _id
          name
        }
        name
        customFieldsData
        tags {
          name
          _id
        }
      }
      totalFee
      vendorUser
    }
  }
`;

export default ({ id }: { id: string }) => {
  const { data, loading } = useQuery(ITEM_QUERY, {
    variables: { id },
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  const item = data.insuranceItemByDealId;


  console.log(item);

  //   const extraButtons = (
  //     <>
  //       <ModalTrigger
  //         title="Places"
  //         size="lg"
  //         trigger={
  //           <button>
  //             <Icon icon={dealPlace ? 'edit-3' : 'plus-circle'} />
  //           </button>
  //         }
  //         content={managePlaces}
  //       />
  //     </>
  //   );

  const renderBody = (item: any) => {
    if (!item) {
      return <EmptyState icon="doc" text="No data" />;
    }

    return 'Item details';
  };

  return (
    <Box
      title={__(`${'Item details'}`)}
      //   extraButtons={extraButtons}
      isOpen={true}
      name="showLocation"
    >
      {renderBody(item)}
    </Box>
  );
};
