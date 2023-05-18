import { __, Chooser, FormControl, Icon, ModalTrigger } from '@erxes/ui/src';
import ProductChooser from '@erxes/ui-products/src/containers/ProductChooser';
import { IProduct } from '@erxes/ui-products/src/types';
import React from 'react';

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

type Props = {
  collateralsData?: ICollateralData[];
  collateralData: ICollateralData;
  removeCollateralItem?: (collateralId: string) => void;
  onChangeCollateralsData?: (collateralsData: ICollateralData[]) => void;
  currentCollateral?: string;
};

type State = {
  categoryId: string;
  currentCollateral: string;
  insurancePercent: number;
};

class CollateralItem extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      categoryId: '',
      currentCollateral: props.currentCollateral,
      insurancePercent:
        (props.collateralData &&
          props.collateralData.insuranceType &&
          props.collateralData.insuranceType.percent) ||
        0
    };
  }

  componentDidMount = () => {};

  onFieldClick = e => {
    e.target.select();
  };

  onChangeField = (
    type: string,
    value: string | boolean | IProduct | IInsuranceType | number | undefined,
    collateralDataId: string
  ) => {
    const { collateralsData, onChangeCollateralsData } = this.props;

    if (collateralsData) {
      const collateralData = collateralsData.find(
        p => p._id === collateralDataId
      );
      if (collateralData) {
        collateralData[type] = value;
      }

      if (onChangeCollateralsData) {
        onChangeCollateralsData(collateralsData);
      }
    }
  };

  renderCollateralTrigger(collateral?: IProduct) {
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
  }

  onChangeCategory = (categoryId: string) => {
    this.setState({ categoryId });
  };

  renderCollateralModal(collateralData: ICollateralData) {
    const collateralOnChange = (collaterals: IProduct[]) => {
      const collateral =
        collaterals && collaterals.length === 1 ? collaterals[0] : null;

      if (collateral) {
        this.onChangeField('collateral', collateral, collateralData._id);
        this.onChangeField('cost', collateral.unitPrice, collateralData._id);
        this.onCalc('cost', collateral.unitPrice, collateralData);
        this.changeCurrentCollateral(collateral._id);
      }
    };

    const content = props => (
      <ProductChooser
        {...props}
        onSelect={collateralOnChange}
        onChangeCategory={this.onChangeCategory}
        categoryId={this.state.categoryId}
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
        trigger={this.renderCollateralTrigger(collateralData.collateral)}
        size="lg"
        content={content}
      />
    );
  }

  renderInsuranceTypeTrigger(insuranceType?: IInsuranceType) {
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
  }

  renderInsuranceTypeModal(collateralData: ICollateralData) {
    const insuranceTypeOnChange = (insuranceTypes: IInsuranceType[]) => {
      const insuranceType =
        insuranceTypes && insuranceTypes.length === 1
          ? insuranceTypes[0]
          : null;

      if (!insuranceType) {
        this.onChangeField('insuranceType', undefined, collateralData._id);
        this.onChangeField('insuranceTypeId', '', collateralData._id);
        this.setState({ insurancePercent: 0 });
        this.onChangeField('insuranceAmount', 0, collateralData._id);
        return;
      }

      this.onChangeField('insuranceType', insuranceType, collateralData._id);
      this.onChangeField(
        'insuranceTypeId',
        insuranceType._id,
        collateralData._id
      );

      this.setState({ insurancePercent: insuranceType.percent });
      this.onChangeField(
        'insuranceAmount',
        (collateralData.cost / 100) * insuranceType.percent,
        collateralData._id
      );
    };

    const content = props => (
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
        trigger={this.renderInsuranceTypeTrigger(collateralData.insuranceType)}
        size="lg"
        content={content}
      />
    );
  }

  onChange = e =>
    this.onChangeField(
      (e.target as HTMLInputElement).name,
      (e.target as HTMLInputElement).value,
      this.props.collateralData._id
    );

  onCalcInsurance = collateralData => {
    if (!collateralData.insuranceType) {
      return;
    }

    this.onChangeField(
      'insuranceAmount',
      (collateralData.cost / 100) * collateralData.insuranceType.percent,
      collateralData._id
    );
  };

  onCalc = (name, value, collateralData) => {
    this.onChangeField(name, value, collateralData._id);

    if (name === 'cost') {
      this.onChangeField(
        'marginAmount',
        (Number(value) / 100) * (collateralData.percent || 0),
        collateralData._id
      );
      this.onChangeField(
        'leaseAmount',
        (Number(value) / 100) * (100 - collateralData.percent || 0),
        collateralData._id
      );
      this.onCalcInsurance(collateralData);
      return;
    }

    if (name === 'percent') {
      this.onChangeField(
        'marginAmount',
        (collateralData.cost / 100) * Number(value),
        collateralData._id
      );
      this.onChangeField(
        'leaseAmount',
        (collateralData.cost / 100) * (100 - Number(value)),
        collateralData._id
      );
      this.onCalcInsurance(collateralData);
      return;
    }

    if (name === 'marginAmount' && collateralData.cost) {
      this.onChangeField(
        'percent',
        (Number(value) * 100) / collateralData.cost,
        collateralData._id
      );
      this.onChangeField(
        'leaseAmount',
        collateralData.cost - Number(value),
        collateralData._id
      );
      this.onCalcInsurance(collateralData);
      return;
    }

    if (name === 'leaseAmount' && collateralData.cost) {
      this.onChangeField(
        'marginAmount',
        collateralData.cost - Number(value),
        collateralData._id
      );
      this.onChangeField(
        'percent',
        100 - (Number(value) * 100) / collateralData.cost,
        collateralData._id
      );
      this.onCalcInsurance(collateralData);
      return;
    }
  };

  onChangeWithCalc = e => {
    const name = (e.target as HTMLInputElement).name;
    const value = (e.target as HTMLInputElement).value;
    const { collateralData } = this.props;

    this.onCalc(name, value, collateralData);
  };

  onClick = () => {
    const { collateralData, removeCollateralItem } = this.props;

    return removeCollateralItem && removeCollateralItem(collateralData._id);
  };

  changeCurrentCollateral = (collateralId: string) => {
    this.setState({
      currentCollateral:
        this.state.currentCollateral === collateralId ? '' : collateralId
    });
  };

  renderForm = () => {
    const { collateralData } = this.props;

    if (
      !collateralData.collateral ||
      this.state.currentCollateral === collateralData.collateral._id
    ) {
      return (
        <CollateralItemContainer key={collateralData._id}>
          <ContentRow>
            <CollateralSettings>
              <ItemRow>
                <ItemText>{__('Choose Collateral')}:</ItemText>
                <ContentColumn flex="3">
                  {this.renderCollateralModal(collateralData)}
                </ContentColumn>
              </ItemRow>
              <ItemRow>
                <ItemText>{__('Certificate')}:</ItemText>
                <ContentColumn flex="3">
                  <FormControl
                    value={collateralData.certificate || ''}
                    type="text"
                    name="certificate"
                    onChange={this.onChange}
                    onClick={this.onFieldClick}
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
                    onChange={this.onChange}
                    onClick={this.onFieldClick}
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
                    onChange={this.onChangeWithCalc}
                    onClick={this.onFieldClick}
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
                    onChange={this.onChangeWithCalc}
                    onClick={this.onFieldClick}
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
                    onChange={this.onChangeWithCalc}
                    onClick={this.onFieldClick}
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
                    onChange={this.onChangeWithCalc}
                    onClick={this.onFieldClick}
                  />
                </ContentColumn>
              </ItemRow>
            </CollateralSettings>
            <ContentColumn>
              <ItemRow>
                <ItemText>{__('Choose Insurance Type')}:</ItemText>
                <ContentColumn flex="3">
                  {this.renderInsuranceTypeModal(collateralData)}
                </ContentColumn>
              </ItemRow>
              <ItemRow>
                <ItemText>{__('Insurance Percent')}:</ItemText>
                <ContentColumn flex="3">
                  <FormControl
                    value={this.state.insurancePercent || 0}
                    type="number"
                    placeholder="0"
                    name="insurancePercent"
                    onClick={this.onFieldClick}
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
                    onChange={this.onChange}
                    onClick={this.onFieldClick}
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
    }

    return null;
  };

  render() {
    const { collateralData } = this.props;

    return (
      <CollateralRow
        onRemove={this.onClick}
        activeCollateral={this.state.currentCollateral}
        collateralData={collateralData}
        changeCurrentCollateral={this.changeCurrentCollateral}
      >
        {this.renderForm()}
      </CollateralRow>
    );
  }
}

export default CollateralItem;
