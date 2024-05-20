import Chooser from '@erxes/ui/src/components/Chooser';
import FormControl from '@erxes/ui/src/components/form/Control';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';

import { __ } from 'coreui/utils';
import ProductChooser from '@erxes/ui-products/src/containers/ProductChooser';
import { IProduct } from '@erxes/ui-products/src/types';
import React, { useState } from 'react';

import InsuranceTypeChooser from '../../../insuranceTypes/containers/InsuranceTypeChooser';
import { IInsuranceType } from '../../../insuranceTypes/types';
import {
  CollateralButton,
  CollateralItemContainer,
  CollateralSettings,
  ContentColumn,
  ContentRow,
  ItemRow,
  ItemText
} from '../../styles';
import { ICollateralData } from '../../types';
import CollateralRow from './CollateralRow';
import SelectCollateralType, { CollateralType } from './SelectCollateralType';
import { ICollateralTypeDocument } from '../../../collaterals/types';

type Props = {
  collateralsData?: ICollateralData[];
  collateralData: ICollateralData;
  removeCollateralItem?: (collateralId: string) => void;
  onChangeCollateralsData?: (collateralsData: ICollateralData[]) => void;
  currentCollateral?: string;
};

const CollateralItem = (props: Props) => {
  const [collateralType, setCollateralType] = useState<any>();
  const [categoryId, setCategoryId] = useState('');
  const [currentCollateral, setCurrentCollateral] = useState(
    props.currentCollateral
  );
  const [insurancePercent, setInsurancePercent] = useState(
    (props.collateralData &&
      props.collateralData.insuranceType &&
      props.collateralData.insuranceType.percent) ||
      0
  );

  const onFieldClick = (e) => {
    e.target.select();
  };

  const onChangeField = (
    type: string,
    value: string | boolean | IProduct | IInsuranceType | number | undefined,
    collateralDataId: string
  ) => {
    const { collateralsData, onChangeCollateralsData } = props;

    if (collateralsData) {
      const collateralData = collateralsData.find(
        (p) => p._id === collateralDataId
      );
      if (collateralData) {
        collateralData[type] = value;
      }

      if (onChangeCollateralsData) {
        onChangeCollateralsData(collateralsData);
      }
    }
  };

  const renderCollateralTrigger = (collateral?: IProduct) => {
    let content = (
      <div>
        {__('Choose Collateral')} <Icon icon="plus-circle" />
      </div>
    );

    // if collateral selected
    if (collateral) {
      content = (
        <div>
          {collateral.name} <Icon icon="pen-1" />
        </div>
      );
    }

    return <CollateralButton>{content}</CollateralButton>;
  };

  const onChangeCategory = (categoryId: string) => {
    setCategoryId(categoryId);
  };

  const renderCollateralModal = (collateralData: ICollateralData) => {
    const collateralOnChange = (collaterals: IProduct[]) => {
      const collateral =
        collaterals && collaterals.length === 1 ? collaterals[0] : null;

      if (collateral) {
        onChangeField('collateral', collateral, collateralData._id);
        onChangeField('cost', collateral.unitPrice, collateralData._id);
        onCalc('cost', collateral.unitPrice, collateralData);
        changeCurrentCollateral(collateral._id);
      }
    };

    const content = (props) => (
      <ProductChooser
        {...props}
        onSelect={collateralOnChange}
        onChangeCategory={onChangeCategory}
        categoryId={categoryId}
        data={{
          name: 'Collateral',
          products: collateralData.collateral ? [collateralData.collateral] : []
        }}
        limit={1}
        chooserComponent={Chooser}
      />
    );

    return (
      <ModalTrigger
        title="Choose collateral"
        trigger={renderCollateralTrigger(collateralData.collateral)}
        size="lg"
        content={content}
      />
    );
  };

  const renderInsuranceTypeTrigger = (insuranceType?: IInsuranceType) => {
    let content = (
      <div>
        {__('Choose Collateral')} <Icon icon="plus-circle" />
      </div>
    );

    if (insuranceType) {
      content = (
        <div>
          {insuranceType.name} <Icon icon="pen-1" />
        </div>
      );
    }

    return <CollateralButton>{content}</CollateralButton>;
  };

  const renderInsuranceTypeModal = (collateralData: ICollateralData) => {
    const insuranceTypeOnChange = (insuranceTypes: IInsuranceType[]) => {
      const insuranceType =
        insuranceTypes && insuranceTypes.length === 1
          ? insuranceTypes[0]
          : null;

      if (!insuranceType) {
        onChangeField('insuranceType', undefined, collateralData._id);
        onChangeField('insuranceTypeId', '', collateralData._id);
        setInsurancePercent(0);
        onChangeField('insuranceAmount', 0, collateralData._id);
        return;
      }

      onChangeField('insuranceType', insuranceType, collateralData._id);
      onChangeField('insuranceTypeId', insuranceType._id, collateralData._id);

      setInsurancePercent(insuranceType.percent);
      onChangeField(
        'insuranceAmount',
        (collateralData.cost / 100) * insuranceType.percent,
        collateralData._id
      );
    };

    const content = (props) => (
      <InsuranceTypeChooser
        {...props}
        onSelect={insuranceTypeOnChange}
        data={{
          name: 'InsuranceType',
          insuranceTypes: collateralData.insuranceType
            ? [collateralData.insuranceType]
            : []
        }}
        limit={1}
      />
    );

    return (
      <ModalTrigger
        title="Choose insurance type"
        trigger={renderInsuranceTypeTrigger(collateralData.insuranceType)}
        size="lg"
        content={content}
      />
    );
  };

  const onChange = (e) =>
    onChangeField(
      (e.target as HTMLInputElement).name,
      (e.target as HTMLInputElement).value,
      props.collateralData._id
    );

  const onCalcInsurance = (collateralData) => {
    if (!collateralData.insuranceType) {
      return;
    }

    onChangeField(
      'insuranceAmount',
      (collateralData.cost / 100) * collateralData.insuranceType.percent,
      collateralData._id
    );
  };

  const onCalc = (name, value, collateralData) => {
    onChangeField(name, value, collateralData._id);

    if (name === 'cost') {
      onChangeField(
        'marginAmount',
        (Number(value) / 100) * (collateralData.percent || 0),
        collateralData._id
      );
      onChangeField(
        'leaseAmount',
        (Number(value) / 100) * (100 - collateralData.percent || 0),
        collateralData._id
      );
      onCalcInsurance(collateralData);
      return;
    }

    if (name === 'percent') {
      onChangeField(
        'marginAmount',
        (collateralData.cost / 100) * Number(value),
        collateralData._id
      );
      onChangeField(
        'leaseAmount',
        (collateralData.cost / 100) * (100 - Number(value)),
        collateralData._id
      );
      onCalcInsurance(collateralData);
      return;
    }

    if (name === 'marginAmount' && collateralData.cost) {
      onChangeField(
        'percent',
        (Number(value) * 100) / collateralData.cost,
        collateralData._id
      );
      onChangeField(
        'leaseAmount',
        collateralData.cost - Number(value),
        collateralData._id
      );
      onCalcInsurance(collateralData);
      return;
    }

    if (name === 'leaseAmount' && collateralData.cost) {
      onChangeField(
        'marginAmount',
        collateralData.cost - Number(value),
        collateralData._id
      );
      onChangeField(
        'percent',
        100 - (Number(value) * 100) / collateralData.cost,
        collateralData._id
      );
      onCalcInsurance(collateralData);
      return;
    }
  };

  const onChangeWithCalc = (e) => {
    const name = (e.target as HTMLInputElement).name;
    const value = (e.target as HTMLInputElement).value;
    const { collateralData } = props;

    onCalc(name, value, collateralData);
  };

  const onClick = () => {
    const { collateralData, removeCollateralItem } = props;

    return removeCollateralItem && removeCollateralItem(collateralData._id);
  };

  const changeCurrentCollateral = (collateralId: string) => {
    setCurrentCollateral(
      currentCollateral === collateralId ? '' : collateralId
    );
  };

  const renderForm = () => {
    const { collateralData } = props;

    return (
      <CollateralItemContainer key={collateralData._id}>
        <ContentRow>
          <CollateralSettings>
            <ItemRow>
              <ItemText>{__('Collateral type')}:</ItemText>
              <ContentColumn flex="3">
                <SelectCollateralType
                  label={__('Choose an collateralType')}
                  name="collateralType"
                  initialValue={collateralType}
                  onSelect={(v) => {
                    if (typeof v === 'string') {
                      setCollateralType(v);
                      const collateralType: ICollateralTypeDocument =
                        CollateralType?.[v];

                      onCalc(
                        'percent',
                        collateralType.config?.defaultPercent ?? 0,
                        collateralData
                      );
                    }
                  }}
                  multi={false}
                />
              </ContentColumn>
            </ItemRow>
            <ItemRow>
              <ItemText>{__('Choose Collateral')}:</ItemText>
              <ContentColumn flex="3">
                {renderCollateralModal(collateralData)}
              </ContentColumn>
            </ItemRow>
            <ItemRow>
              <ItemText>{__('Certificate')}:</ItemText>
              <ContentColumn flex="3">
                <FormControl
                  value={collateralData.certificate || ''}
                  type="text"
                  name="certificate"
                  onChange={onChange}
                  onClick={onFieldClick}
                />
              </ContentColumn>
            </ItemRow>
            <ItemRow>
              <ItemText>{__('VINNumber')}:</ItemText>
              <ContentColumn flex="3">
                <FormControl
                  value={collateralData.vinNumber || ''}
                  type="text"
                  name="vinNumber"
                  onChange={onChange}
                  onClick={onFieldClick}
                />
              </ContentColumn>
            </ItemRow>
            <ItemRow>
              <ItemText>{__('Cost')}:</ItemText>
              <ContentColumn flex="3">
                <FormControl
                  value={collateralData.cost || 0}
                  type="number"
                  placeholder="0"
                  name="cost"
                  onChange={onChangeWithCalc}
                  onClick={onFieldClick}
                />
              </ContentColumn>
            </ItemRow>
            <ItemRow>
              <ItemText>{__('Percent')}:</ItemText>
              <ContentColumn flex="3">
                <FormControl
                  value={collateralData.percent || 0}
                  type="number"
                  placeholder="0"
                  name="percent"
                  onChange={onChangeWithCalc}
                  onClick={onFieldClick}
                />
              </ContentColumn>
            </ItemRow>
            <ItemRow>
              <ItemText>{__('Margin Amount')}:</ItemText>
              <ContentColumn flex="3">
                <FormControl
                  value={collateralData.marginAmount || 0}
                  type="number"
                  placeholder="0"
                  name="marginAmount"
                  onChange={onChangeWithCalc}
                  onClick={onFieldClick}
                />
              </ContentColumn>
            </ItemRow>
            <ItemRow>
              <ItemText>{__('Lease Amount')}:</ItemText>
              <ContentColumn flex="3">
                <FormControl
                  value={collateralData.leaseAmount || 0}
                  type="number"
                  placeholder="0"
                  name="leaseAmount"
                  onChange={onChangeWithCalc}
                  onClick={onFieldClick}
                />
              </ContentColumn>
            </ItemRow>
          </CollateralSettings>
          <ContentColumn>
            <ItemRow>
              <ItemText>{__('Choose Insurance Type')}:</ItemText>
              <ContentColumn flex="3">
                {renderInsuranceTypeModal(collateralData)}
              </ContentColumn>
            </ItemRow>
            <ItemRow>
              <ItemText>{__('Insurance Percent')}:</ItemText>
              <ContentColumn flex="3">
                <FormControl
                  value={insurancePercent || 0}
                  type="number"
                  placeholder="0"
                  name="insurancePercent"
                  onClick={onFieldClick}
                />
              </ContentColumn>
            </ItemRow>
            <ItemRow>
              <ItemText>{__('Insurance Amount')}:</ItemText>
              <ContentColumn flex="3">
                <FormControl
                  value={collateralData.insuranceAmount || ''}
                  type="number"
                  placeholder="0"
                  name="insuranceAmount"
                  onChange={onChange}
                  onClick={onFieldClick}
                />
              </ContentColumn>
            </ItemRow>

            <ItemRow>
              <ItemText>&nbsp;</ItemText>
            </ItemRow>
          </ContentColumn>
        </ContentRow>
      </CollateralItemContainer>
    );
  };

  const { collateralData } = props;

  return (
    <CollateralRow
      onRemove={onClick}
      activeCollateral={currentCollateral}
      collateralData={collateralData}
      changeCurrentCollateral={changeCurrentCollateral}
    >
      {renderForm()}
    </CollateralRow>
  );
};

export default CollateralItem;
