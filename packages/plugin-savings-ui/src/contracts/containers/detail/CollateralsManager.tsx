import { AppConsumer } from '@erxes/ui/src';
import { Alert, withProps } from '@erxes/ui/src';
import { IProduct } from '@erxes/ui-products/src/types';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';

import CollateralsManager from '../../components/collaterals/CollateralsManager';
import { mutations } from '../../graphql';
import { FillFromDealMutationResponse, ICollateralData } from '../../types';

type Props = {
  onChangeCollateralsData: (collateralsData: ICollateralData[]) => void;
  saveCollateralsData: () => void;
  collateralsData: ICollateralData[];
  collaterals: IProduct[];
  closeModal: () => void;
  currentCollateral: string;
  contractId: string;
};

type FinalProps = {} & Props & FillFromDealMutationResponse;

type State = {
  collateralsData: ICollateralData[];
};

class CollateralsManagerContainer extends React.Component<FinalProps, State> {
  constructor(props) {
    super(props);

    this.state = {
      collateralsData: this.props.collateralsData
    };
  }

  fillFromDeal = () => {
    const { getProductsData, contractId } = this.props;
    getProductsData({ variables: { contractId } })
      .then(data => {
        const nData = data.data.getProductsData.collateralsData;

        this.props.onChangeCollateralsData(nData);
        this.setState({ collateralsData: nData });
      })
      .catch(err => {
        Alert.error(err.message);
      });
  };

  render() {
    return (
      <AppConsumer>
        {({ currentUser }) => {
          const configs = currentUser?.configs || {};
          const extendedProps = {
            ...this.props,
            currencies: configs.dealCurrency || [],
            collateralsData: this.state.collateralsData,
            fillFromDeal: this.fillFromDeal
          };

          return <CollateralsManager {...extendedProps} />;
        }}
      </AppConsumer>
    );
  }
}

export default withProps<Props>(
  compose(
    graphql<{}, FillFromDealMutationResponse, { _id: string }>(
      gql(mutations.getProductsData),
      {
        name: 'getProductsData'
      }
    )
  )(CollateralsManagerContainer)
);
