import { __, Box, EmptyState, Icon, ModalTrigger } from '@erxes/ui/src';
import { IProduct } from '@erxes/ui-products/src/types';
import React from 'react';

import CollateralManager from '../../containers/detail/CollateralsManager';
import {
  CollateralColumn,
  CollateralField,
  ItemLabel,
  ItemValue,
  RowCollateral,
  ScrollTableColls
} from '../../styles';
import { ICollateralData } from '../../types';

type Props = {
  collateralsData: ICollateralData[];
  collaterals: IProduct[];
  onChangeCollateralsData: (collateralsData: ICollateralData[]) => void;
  onChangeCollaterals: (prs: IProduct[]) => void;
  saveCollateralsData: () => void;
  contractId: string;
};

function CollateralsSection({
  collaterals,
  collateralsData,
  onChangeCollateralsData,
  saveCollateralsData,
  contractId
}: Props) {
  const contentWithId = (collateralId?: string) => {
    const content = props => (
      <CollateralManager
        {...props}
        currentCollateral={collateralId}
        onChangeCollateralsData={onChangeCollateralsData}
        collateralsData={collateralsData}
        collaterals={collaterals}
        saveCollateralsData={saveCollateralsData}
        contractId={contractId}
      />
    );

    return content;
  };

  const renderCollateralFormModal = (
    trigger: React.ReactNode,
    collateralId?: string
  ) => {
    return (
      <ModalTrigger
        title="Manage Collateral"
        size="lg"
        dialogClassName="modal-1000w"
        trigger={trigger}
        content={contentWithId(collateralId)}
      />
    );
  };

  const renderRow = (label, value) => {
    return (
      <CollateralField>
        <ItemLabel>{__(`${label}`)}</ItemLabel>
        <ItemValue>{value || '-'}</ItemValue>
      </CollateralField>
    );
  };

  const renderCollateral = (collateralData: ICollateralData) => {
    const { insuranceType, collateral } = collateralData;
    return (
      <RowCollateral>
        <CollateralColumn>
          {renderRow(
            'Insurance Type',
            (insuranceType && insuranceType.name) || ''
          )}
          {renderRow(
            'Insurance Amount',
            Number(collateralData.insuranceAmount || 0).toLocaleString()
          )}
          {renderRow(
            'Collateral Item',
            (collateral && `${collateral.code} - ${collateral.name}`) || ''
          )}
          {renderRow('Cost', Number(collateralData.cost).toLocaleString())}
          {renderRow(
            'Margin Amount',
            Number(collateralData.marginAmount).toLocaleString()
          )}
          {renderRow(
            'Lease Amount',
            Number(collateralData.leaseAmount).toLocaleString()
          )}
        </CollateralColumn>
      </RowCollateral>
    );
  };

  return (
    <Box
      title={__('Collaterals')}
      extraButtons={renderCollateralFormModal(
        <button>
          <Icon icon="edit-3" />
        </button>
      )}
      name="showCollateral"
      isOpen={true}
    >
      <ScrollTableColls>
        <table>
          {collateralsData.map((collateralData, index) => (
            <div key={index}>{renderCollateral(collateralData)}</div>
          ))}
          {collaterals.length === 0 && (
            <EmptyState icon="list-ul" text="No items" />
          )}
        </table>
      </ScrollTableColls>
    </Box>
  );
}

export default CollateralsSection;
