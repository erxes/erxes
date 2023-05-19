import { Icon, __ } from '@erxes/ui/src';

import React from 'react';
import { NameWrapper, RemoveRow } from '../../styles';
import { ICollateralData } from '../../types';

type Props = {
  collateralData: ICollateralData;
  children: React.ReactNode;
  activeCollateral?: string;
  onRemove: () => void;
  changeCurrentCollateral: (collateralId: string) => void;
};

function CollateralRow(props: Props) {
  const renderAmmount = (value: number) => {
    if (!value || value === 0) {
      return '-';
    }

    return (
      <>
        {Number(value).toLocaleString()} <strong>₮</strong>
      </>
    );
  };

  const onRemove = e => {
    e.stopPropagation();
    props.onRemove();
  };

  const {
    collateral,
    cost,
    percent,
    marginAmount,
    leaseAmount,
    insuranceType,
    insuranceAmount,
    _id
  } = props.collateralData;
  const id = collateral ? collateral._id : _id;

  const changeCurrent = () => props.changeCurrentCollateral(id);
  return (
    <>
      <tr
        id={id}
        className={props.activeCollateral === id ? 'active' : ''}
        onClick={changeCurrent}
      >
        <td>{insuranceType ? insuranceType.name : __('Not selected')}</td>
        <td>{renderAmmount(insuranceAmount)}</td>
        <td>
          <NameWrapper>
            {collateral ? collateral.name : __('Not selected')}
          </NameWrapper>
        </td>
        <td>{renderAmmount(cost)}</td>
        <td>{percent}%</td>
        <td>{renderAmmount(marginAmount)}</td>
        <td>{renderAmmount(leaseAmount)}</td>
        <td>
          <RemoveRow>
            <Icon onClick={onRemove} icon="times-circle" />
          </RemoveRow>
        </td>
      </tr>
      {props.children && (
        <tr className="active">
          <td colSpan={8}>{props.children}</td>
        </tr>
      )}
    </>
  );
}

export default CollateralRow;
