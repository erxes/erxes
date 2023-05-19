import {
  __,
  Alert,
  Button,
  EmptyState,
  MainStyleModalFooter as ModalFooter,
  Table
} from '@erxes/ui/src';
import { IProduct } from '@erxes/ui-products/src/types';
import React from 'react';

import { Add, CollateralTableWrapper, FormContainer } from '../../styles';
import { ICollateralData } from '../../types';
import CollateralItem from './CollateralItem';

type Props = {
  onChangeCollateralsData: (collateralsData: ICollateralData[]) => void;
  saveCollateralsData: () => void;
  fillFromDeal: () => void;
  collateralsData: ICollateralData[];
  collaterals: IProduct[];
  closeModal: () => void;
  currentCollateral: string;
};

type State = {
  collateralsData: ICollateralData[];
  currentTab: string;
  tempId: string;
};

class CollateralForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      collateralsData: this.props.collateralsData || [],
      currentTab: 'collaterals',
      tempId: ''
    };
  }

  componentDidMount() {
    if (this.props.collateralsData.length === 0) {
      this.addCollateralItem();
    }
  }

  addCollateralItem = () => {
    const { onChangeCollateralsData } = this.props;
    const { collateralsData } = this.state;

    this.setState({ tempId: Math.random().toString() }, () => {
      collateralsData.push({
        _id: this.state.tempId,

        collateralId: '',
        percent: 0,
        cost: 0,
        marginAmount: 0,
        leaseAmount: 0,

        insuranceTypeId: '',
        insuranceAmount: 0
      });

      onChangeCollateralsData(collateralsData);
    });
  };

  removeCollateralItem = collateralId => {
    const { onChangeCollateralsData } = this.props;
    const { collateralsData } = this.state;

    const removedCollateralsData = collateralsData.filter(
      p => p._id !== collateralId
    );

    this.setState({ collateralsData: removedCollateralsData }, () => {
      onChangeCollateralsData(removedCollateralsData);
    });
  };

  renderContent() {
    const { onChangeCollateralsData, currentCollateral } = this.props;
    const { collateralsData } = this.state;

    if (collateralsData.length === 0) {
      return (
        <EmptyState size="full" text="No collateral or services" icon="box" />
      );
    }

    return (
      <CollateralTableWrapper>
        <Table>
          <thead>
            <tr>
              <th>{__('Insurance type')}</th>
              <th>{__('Insurance amount')}</th>
              <th>{__('Collateral')}</th>
              <th>{__('Cost')}</th>
              <th>{__('Percent')}</th>
              <th>{__('Margin Amount')}</th>
              <th>{__('Lease Amount')}</th>
              <th />
            </tr>
          </thead>
          <tbody id="collaterals">
            {collateralsData.map(collateralData => (
              <CollateralItem
                key={collateralData._id}
                collateralData={collateralData}
                removeCollateralItem={this.removeCollateralItem}
                collateralsData={collateralsData}
                onChangeCollateralsData={onChangeCollateralsData}
                currentCollateral={currentCollateral}
              />
            ))}
          </tbody>
        </Table>
      </CollateralTableWrapper>
    );
  }

  onClick = () => {
    const { saveCollateralsData, closeModal } = this.props;
    const { collateralsData } = this.state;

    if (collateralsData.length !== 0) {
      for (const data of collateralsData) {
        if (!data.collateral) {
          return Alert.error('Please choose a collateral');
        }
      }
    }

    saveCollateralsData();
    closeModal();
  };

  renderTabContent() {
    return (
      <FormContainer>
        {this.renderContent()}
        <Add>
          <Button
            uppercase={false}
            btnStyle="primary"
            onClick={this.addCollateralItem}
            icon="plus-circle"
          >
            {__('Add Collateral')}
          </Button>
        </Add>
      </FormContainer>
    );
  }

  onTabClick = (currentTab: string) => {
    this.setState({ currentTab });
  };

  render() {
    return (
      <>
        {this.renderTabContent()}

        <ModalFooter>
          <Button
            uppercase={false}
            btnStyle="link"
            onClick={this.props.fillFromDeal}
            icon="coffee"
          >
            {__('From deals products')}
          </Button>
          <Button
            btnStyle="simple"
            onClick={this.props.closeModal}
            icon="times-circle"
            uppercase={false}
          >
            Cancel
          </Button>

          <Button
            btnStyle="success"
            onClick={this.onClick}
            icon="check-circle"
            uppercase={false}
          >
            Save
          </Button>
        </ModalFooter>
      </>
    );
  }
}

export default CollateralForm;
