import {
  Button,
  Chooser,
  CollapseContent,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon,
  ModalTrigger,
  MainStyleTitle as Title,
  Wrapper
} from '@erxes/ui/src';
import { dimensions } from '@erxes/ui/src';
import styled from 'styled-components';

import React from 'react';
import { JOURNALS_KEY_LABELS } from '../constants';
import { IContractTypeDetail } from '../types';
import { __ } from 'coreui/utils';
import ProductChooser from '@erxes/ui-products/src/containers/ProductChooser';
import { CollateralButton } from '../../contracts/styles';
import { ScrolledContent } from '@erxes/ui-cards/src/boards/styles/common';
import { ScrollWrapper } from '@erxes/ui/src/styles/main';

export const DISTRICTS = [
  { value: 'Архангай', label: 'Архангай' },
  { value: 'Баян-Өлгий', label: 'Баян-Өлгий' },
  { value: 'Баянхонгор', label: 'Баянхонгор' },
  { value: 'Булган', label: 'Булган' },
  { value: 'Говь-Алтай', label: 'Говь-Алтай' },
  { value: 'Дорноговь', label: 'Дорноговь' },
  { value: 'Дорнод', label: 'Дорнод' },
  { value: 'Дундговь', label: 'Дундговь' },
  { value: 'Завхан', label: 'Завхан' },
  { value: 'Өвөрхангай', label: 'Өвөрхангай' },
  { value: 'Өмнөговь', label: 'Өмнөговь' },
  { value: 'Сүхбаатар аймаг', label: 'Сүхбаатар аймаг' },
  { value: 'Сэлэнгэ', label: 'Сэлэнгэ' },
  { value: 'Төв', label: 'Төв' },
  { value: 'Увс', label: 'Увс' },
  { value: 'Ховд', label: 'Ховд' },
  { value: 'Хөвсгөл', label: 'Хөвсгөл' },
  { value: 'Хэнтий', label: 'Хэнтий' },
  { value: 'Дархан-Уул', label: 'Дархан-Уул' },
  { value: 'Орхон', label: 'Орхон' },
  { value: 'Говьсүмбэр', label: 'Говьсүмбэр' },
  { value: 'Хан-Уул', label: 'Хан-Уул' },
  { value: 'Баянзүрх', label: 'Баянзүрх' },
  { value: 'Сүхбаатар', label: 'Сүхбаатар' },
  { value: 'Баянгол', label: 'Баянгол' },
  { value: 'Багануур', label: 'Багануур' },
  { value: 'Багахангай', label: 'Багахангай' },
  { value: 'Налайх', label: 'Налайх' },
  { value: 'Сонгинохайрхан', label: 'Сонгинохайрхан' },
  { value: 'Чингэлтэй', label: 'Чингэлтэй' }
];

const ContentBox = styled.div`
  padding: ${dimensions.coreSpacing}px;
  max-width: 640px;
  margin: 0 auto;
`;

const ContentWrapper = styled.div`
  background: white;
`;

type Props = {
  contractType: IContractTypeDetail;
  saveItem: (doc: IContractTypeDetail, callback?: (item) => void) => void;
};

type State = {
  currentMap: any;
};

class GeneralSettings extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      currentMap: this.props.contractType.config || {}
    };
  }

  save = e => {
    e.preventDefault();
    const { contractType } = this.props;
    const { currentMap } = this.state;

    this.props.saveItem({ ...contractType, config: currentMap });
  };

  onChangeConfig = (code: string, value) => {
    const { currentMap } = this.state;

    currentMap[code] = value;

    this.setState({ currentMap });
  };

  onChangeInput = (code: string, e) => {
    this.onChangeConfig(code, e.target.value);
  };

  onChangeCheckbox = (code: string, e) => {
    this.onChangeConfig(code, e.target.checked);
  };

  renderItem = (key: string, description?: string, controlProps?: any) => {
    const { currentMap } = this.state;

    return (
      <FormGroup>
        <ControlLabel>{__(JOURNALS_KEY_LABELS[key])}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
          {...controlProps}
          value={currentMap[key]}
          onChange={this.onChangeInput.bind(this, key)}
        />
      </FormGroup>
    );
  };

  renderCheckbox = (key: string, description?: string, backElement?: any) => {
    const { currentMap } = this.state;

    return (
      <FormGroup>
        {backElement && (
          <div style={{ display: 'inline-block', marginRight: '5px' }}>
            {backElement}
          </div>
        )}
        <ControlLabel>{__(JOURNALS_KEY_LABELS[key])}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
          checked={currentMap[key]}
          onChange={this.onChangeCheckbox.bind(this, key)}
          componentClass="checkbox"
        />
      </FormGroup>
    );
  };

  renderProductTrigger(collateral?: any) {
    let content = (
      <div>
        {__('Choose E-Barimt Product')} <Icon icon="plus-circle" />
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

  renderProductModal(key: string) {
    const { currentMap } = this.state;
    const product = currentMap[key];

    const productOnChange = (products: any[]) => {
      const product = products && products.length === 1 ? products[0] : null;

      if (product) {
        this.onChangeConfig(key, product);
      }
    };

    const content = props => (
      <ProductChooser
        {...props}
        onSelect={productOnChange}
        data={{
          name: 'Product',
          products: product ? [product] : []
        }}
        limit={1}
        chooserComponent={Chooser}
      />
    );

    return (
      <ModalTrigger
        title="Choose product"
        trigger={this.renderProductTrigger(product)}
        size="lg"
        content={content}
      />
    );
  }

  render() {
    const actionButtons = (
      <Button
        btnStyle="primary"
        onClick={this.save}
        icon="check-circle"
        uppercase={false}
      >
        {__('Save')}
      </Button>
    );

    const content = (
      <ScrollWrapper>
        <ContentBox>
          <CollapseContent title={__('Loan payment')}>
            {this.renderItem('transAccount')}
            {this.renderItem('normalAccount')}
            {this.renderItem('expiredAccount')}
            {this.renderItem('doubtfulAccount')}
            {this.renderItem('negativeAccount')}
            {this.renderItem('badAccount')}
            {this.renderCheckbox('amountHasEBarimt')}
          </CollapseContent>

          <CollapseContent title={__('Interest')}>
            {this.renderItem('interestAccount')}
            {this.renderCheckbox('interestHasEBarimt')}
          </CollapseContent>

          <CollapseContent title={__('Insurance')}>
            {this.renderItem('insuranceAccount')}
          </CollapseContent>

          <CollapseContent title={__('Loss')}>
            {this.renderItem('undueAccount')}
            {this.renderCheckbox('undueHasEBarimt')}
          </CollapseContent>

          <CollapseContent title={__('Other')}>
            {this.renderItem('debtAccount')}
            {this.renderItem('otherReceivable')}
            {this.renderItem('feeIncomeAccount')}
          </CollapseContent>

          <CollapseContent title={__('EBarimt')}>
            {this.renderItem('eBarimtAccount')}
            {this.renderCheckbox('isAutoSendEBarimt')}
            {this.renderCheckbox('isHasVat')}
            <FormGroup>
              <ControlLabel>{__('Provice/District')}</ControlLabel>
              <FormControl
                componentClass="select"
                defaultValue={this.state.currentMap.districtName}
                options={DISTRICTS}
                onChange={this.onChangeInput.bind(this, 'districtName')}
                required={true}
              />
            </FormGroup>
            {this.renderItem('organizationRegister')}
            {this.renderItem('defaultGSCode')}
            <div
              style={{
                boxShadow: '1px 0px 5px rgba(0,0,0,0.1)',
                padding: 20,
                paddingBottom: 10,
                borderRadius: 10
              }}
            >
              {this.renderCheckbox('isAmountUseEBarimt')}
              {this.state?.currentMap?.isAmountUseEBarimt && (
                <FormGroup>
                  <ControlLabel>{__('Product')}</ControlLabel>
                  {this.renderProductModal('amountEBarimtProduct')}
                </FormGroup>
              )}
            </div>
            <div
              style={{
                boxShadow: '1px 0px 5px rgba(0,0,0,0.1)',
                padding: 20,
                paddingBottom: 10,
                borderRadius: 10,
                marginTop: 10
              }}
            >
              {this.renderCheckbox('isInterestUseEBarimt')}
              {this.state?.currentMap?.isInterestUseEBarimt && (
                <FormGroup>
                  <ControlLabel>{__('Product')}</ControlLabel>
                  {this.renderProductModal('interestEBarimtProduct')}
                </FormGroup>
              )}
            </div>
            <div
              style={{
                boxShadow: '1px 0px 5px rgba(0,0,0,0.1)',
                padding: 20,
                paddingBottom: 10,
                borderRadius: 10,
                marginTop: 10
              }}
            >
              {this.renderCheckbox('isUndueUseEBarimt')}
              {this.state?.currentMap?.isUndueUseEBarimt && (
                <FormGroup>
                  <ControlLabel>{__('Product')}</ControlLabel>
                  {this.renderProductModal('undueEBarimtProduct')}
                </FormGroup>
              )}
            </div>
          </CollapseContent>

          <CollapseContent title={__('Classification')}>
            {this.renderItem('normalExpirationDay', 'Normal /Expiration Day/', {
              type: 'number'
            })}
            {this.renderItem(
              'expiredExpirationDay',
              'Expired /Expiration Day/',
              {
                type: 'number'
              }
            )}
            {this.renderItem('doubtExpirationDay', 'Doubt /Expiration Day/', {
              type: 'number'
            })}
            {this.renderItem(
              'negativeExpirationDay',
              'Negative /Expiration Day/',
              {
                type: 'number'
              }
            )}
            {this.renderItem('badExpirationDay', 'Bad /Expiration Day/', {
              type: 'number'
            })}
          </CollapseContent>
          <CollapseContent title={__('Range config')}>
            {this.renderItem('minInterest', 'Min interest /Month/', {
              type: 'number'
            })}
            {this.renderItem('maxInterest', 'Max interest /Month/', {
              type: 'number'
            })}
            {this.renderItem('defaultInterest', 'Default interest /Month/', {
              type: 'number'
            })}
            {this.renderItem('minTenor', 'Min tenor /Month/', {
              type: 'number'
            })}
            {this.renderItem('maxTenor', 'Max tenor /Month/', {
              type: 'number'
            })}
            {this.renderItem('minAmount', 'Min amount /Month/', {
              type: 'number',
              useNumberFormat: true
            })}
            {this.renderItem('maxAmount', 'Max amount /Month/', {
              type: 'number',
              useNumberFormat: true
            })}
          </CollapseContent>
        </ContentBox>
      </ScrollWrapper>
    );

    return (
      <ContentWrapper>
        <Wrapper.ActionBar
          left={<Title>{__('Journals configs')}</Title>}
          right={actionButtons}
        />
        {content}
      </ContentWrapper>
    );
  }
}

export default GeneralSettings;
