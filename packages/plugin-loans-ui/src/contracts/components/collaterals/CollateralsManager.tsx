import Alert from '@erxes/ui/src/utils/Alert';
import Button from '@erxes/ui/src/components/Button';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import Table from '@erxes/ui/src/components/table';
import { MainStyleModalFooter as ModalFooter } from '@erxes/ui/src/styles/eindex';

import { IProduct } from '@erxes/ui-products/src/types';
import React, { useEffect, useState } from 'react';

import { Add, CollateralTableWrapper, FormContainer } from '../../styles';
import { ICollateralData } from '../../types';
import CollateralItem from './CollateralItem';
import { __ } from 'coreui/utils';

type Props = {
  onChangeCollateralsData: (collateralsData: ICollateralData[]) => void;
  saveCollateralsData: () => void;
  fillFromDeal: () => void;
  collateralsData: ICollateralData[];
  collaterals: IProduct[];
  closeModal: () => void;
  currentCollateral: string;
};

const CollateralForm = (props: Props) => {
  const [collateralsData, setCollateralsData] = useState(
    props.collateralsData || ([] as ICollateralData[]),
  );
  const [tempId, setTempId] = useState('');
  const {
    onChangeCollateralsData,
    currentCollateral,
    saveCollateralsData,
    closeModal,
  } = props;

  useEffect(() => {
    if (collateralsData.length === 0) {
      addCollateralItem();
    }
  }, [collateralsData]);

  useEffect(() => {
    collateralsData.push({
      _id: tempId,

      collateralId: '',
      percent: 0,
      cost: 0,
      marginAmount: 0,
      leaseAmount: 0,

      insuranceTypeId: '',
      insuranceAmount: 0,
    });

    onChangeCollateralsData(collateralsData);
  }, [tempId]);

  useEffect(() => {
    onChangeCollateralsData(collateralsData);
  }, [collateralsData]);

  const addCollateralItem = () => {
    setTempId(Math.random().toString());
  };

  const removeCollateralItem = (collateralId) => {
    const removedCollateralsData = collateralsData.filter(
      (p) => p._id !== collateralId,
    );

    setCollateralsData(removedCollateralsData);
  };

  const renderContent = () => {
    if (collateralsData.length === 0) {
      return (
        <EmptyState size="full" text={__("No collateral or services")} icon="box" />
      );
    }

    return (
      <CollateralTableWrapper>
        <Table $striped>
          <thead>
            <tr>
              <th>{__('Insurance type')}</th>
              <th>{__('Insurance Amount')}</th>
              <th>{__('Collateral')}</th>
              <th>{__('Cost')}</th>
              <th>{__('Percent')}</th>
              <th>{__('Margin Amount')}</th>
              <th>{__('Lease Amount')}</th>
              <th />
            </tr>
          </thead>
          <tbody id="collaterals">
            {collateralsData.map((collateralData) => (
              <CollateralItem
                key={collateralData._id}
                collateralData={collateralData}
                removeCollateralItem={removeCollateralItem}
                collateralsData={collateralsData}
                onChangeCollateralsData={onChangeCollateralsData}
                currentCollateral={currentCollateral}
              />
            ))}
          </tbody>
        </Table>
      </CollateralTableWrapper>
    );
  };

  const onClick = () => {
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

  const renderTabContent = () => {
    return (
      <FormContainer>
        {renderContent()}
        <Add>
          <Button
            uppercase={false}
            btnStyle="primary"
            onClick={addCollateralItem}
            icon="plus-circle"
          >
            {__('Add Collateral')}
          </Button>
        </Add>
      </FormContainer>
    );
  };

  return (
    <>
      {renderTabContent()}

      <ModalFooter>
        <Button
          uppercase={false}
          btnStyle="link"
          onClick={props.fillFromDeal}
          icon="coffee"
        >
          {__('From deals products')}
        </Button>
        <Button
          btnStyle="simple"
          onClick={closeModal}
          icon="times-circle"
          uppercase={false}
        >
          {__('Cancel')}
        </Button>

        <Button
          btnStyle="success"
          onClick={onClick}
          icon="check-circle"
          uppercase={false}
        >
          {__('Save')}
        </Button>
      </ModalFooter>
    </>
  );
};

export default CollateralForm;
