import { AppConsumer } from '@erxes/ui/src';
import { Alert } from '@erxes/ui/src';
import { IProduct } from '@erxes/ui-products/src/types';
import { gql } from '@apollo/client';
import React, { useState } from 'react';

import CollateralsManager from '../../components/collaterals/CollateralsManager';
import { mutations } from '../../graphql';
import { FillFromDealMutationResponse, ICollateralData } from '../../types';
import { useMutation } from '@apollo/client';

type Props = {
  onChangeCollateralsData: (collateralsData: ICollateralData[]) => void;
  saveCollateralsData: () => void;
  collateralsData: ICollateralData[];
  collaterals: IProduct[];
  closeModal: () => void;
  currentCollateral: string;
  contractId: string;
};

const CollateralsManagerContainer = (props: Props) => {
  const [collateralsData, setCollateralsData] = useState<ICollateralData[]>(
    props.collateralsData,
  );

  const [getProductsData] = useMutation<FillFromDealMutationResponse>(
    gql(mutations.getProductsData),
  );

  const fillFromDeal = () => {
    const { contractId, onChangeCollateralsData } = props;
    getProductsData({ variables: { contractId } })
      .then((data) => {
        const nData = (data.data || ({} as any)).getProductsData
          .collateralsData;

        onChangeCollateralsData(nData);
        setCollateralsData(nData);
      })
      .catch((err) => {
        Alert.error(err.message);
      });
  };

  return (
    <AppConsumer>
      {({ currentUser }) => {
        const configs = currentUser?.configs || {};
        const extendedProps = {
          ...props,
          currencies: configs.dealCurrency || [],
          collateralsData: collateralsData,
          fillFromDeal,
        };

        return <CollateralsManager {...extendedProps} />;
      }}
    </AppConsumer>
  );
};

export default CollateralsManagerContainer;
