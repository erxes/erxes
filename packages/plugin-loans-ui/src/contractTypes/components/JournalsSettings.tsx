import Button from '@erxes/ui/src/components/Button';
import Chooser from '@erxes/ui/src/components/Chooser';
import CollapseContent from '@erxes/ui/src/components/CollapseContent';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import dimensions from '@erxes/ui/src/styles/dimensions';
import { MainStyleTitle as Title } from '@erxes/ui/src/styles/eindex';

import styled from 'styled-components';
import React, { useState } from 'react';
import { JOURNALS_KEY_LABELS, LEASE_TYPES } from '../constants';
import { IContractTypeDetail } from '../types';
import { __ } from 'coreui/utils';
import ProductChooser from '@erxes/ui-products/src/containers/ProductChooser';
import { CollateralButton } from '../../contracts/styles';
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
  { value: 'Чингэлтэй', label: 'Чингэлтэй' },
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

const GeneralSettings = (props: Props) => {
  const [currentMap, setCurrentMap] = useState(props.contractType.config || {});
  const { contractType } = props;

  const save = (e) => {
    e.preventDefault();

    props.saveItem({ ...contractType, config: currentMap });
  };

  const onChangeConfig = (code: string, value) => {
    currentMap[code] = value;

    setCurrentMap(currentMap);
  };

  const onChangeInput = (code: string, e) => {
    onChangeConfig(code, e.target.value);
  };

  const onChangeCheckbox = (code: string, e) => {
    onChangeConfig(code, e.target.checked);
  };

  const renderItem = (
    key: string,
    description?: string,
    controlProps?: any,
  ) => {
    return (
      <FormGroup>
        <ControlLabel>{__(JOURNALS_KEY_LABELS[key])}</ControlLabel>
        {description && <p>{__(description)}</p>}
        <FormControl
          {...controlProps}
          value={currentMap[key]}
          onChange={onChangeInput.bind(this, key)}
        />
      </FormGroup>
    );
  };

  const renderCheckbox = (
    key: string,
    description?: string,
    backElement?: any,
  ) => {
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
          onChange={onChangeCheckbox.bind(this, key)}
          componentClass="checkbox"
        />
      </FormGroup>
    );
  };

  const renderProductTrigger = (collateral?: any) => {
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
  };

  const renderProductModal = (key: string) => {
    const product = currentMap[key];

    const productOnChange = (products: any[]) => {
      const product = products && products.length === 1 ? products[0] : null;

      if (product) {
        onChangeConfig(key, product);
      }
    };

    const content = (props) => (
      <ProductChooser
        {...props}
        onSelect={productOnChange}
        data={{
          name: 'Product',
          products: product ? [product] : [],
        }}
        limit={1}
        chooserComponent={Chooser}
      />
    );

    return (
      <ModalTrigger
        title="Choose product"
        trigger={renderProductTrigger(product)}
        size="lg"
        content={content}
      />
    );
  };

  const actionButtons = (
    <Button
      btnStyle="primary"
      onClick={save}
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
          {renderItem('transAccount')}
          {renderItem('normalAccount')}
          {renderItem('expiredAccount')}
          {renderItem('doubtfulAccount')}
          {renderItem('negativeAccount')}
          {renderItem('badAccount')}
          {renderCheckbox('amountHasEBarimt')}
        </CollapseContent>

        <CollapseContent title={__('Interest')}>
          {renderItem('interestAccount')}
          {renderCheckbox('interestHasEBarimt')}
        </CollapseContent>

        <CollapseContent title={__('Insurance')}>
          {renderItem('insuranceAccount')}
        </CollapseContent>

        <CollapseContent title={__('Loss')}>
          {renderItem('undueAccount')}
          {renderCheckbox('undueHasEBarimt')}
        </CollapseContent>

        <CollapseContent title={__('Other')}>
          {renderItem('debtAccount')}
          {renderItem('otherReceivable')}
          {renderItem('feeIncomeAccount')}
        </CollapseContent>

        <CollapseContent title={__('EBarimt')}>
          {renderItem('eBarimtAccount')}
          {renderCheckbox('isAutoSendEBarimt')}
          {renderCheckbox('isHasVat')}
          <FormGroup>
            <ControlLabel>{__('Provice/District')}</ControlLabel>
            <FormControl
              componentClass="select"
              defaultValue={currentMap.districtName}
              options={DISTRICTS}
              onChange={onChangeInput.bind(this, 'districtName')}
              required={true}
            />
          </FormGroup>
          {renderItem('organizationRegister')}
          {renderItem('defaultGSCode')}
          <div
            style={{
              boxShadow: '1px 0px 5px rgba(0,0,0,0.1)',
              padding: 20,
              paddingBottom: 10,
              borderRadius: 10,
            }}
          >
            {renderCheckbox('isAmountUseEBarimt')}
            {currentMap?.isAmountUseEBarimt && (
              <FormGroup>
                <ControlLabel>{__('Product')}</ControlLabel>
                {renderProductModal('amountEBarimtProduct')}
              </FormGroup>
            )}
          </div>
          <div
            style={{
              boxShadow: '1px 0px 5px rgba(0,0,0,0.1)',
              padding: 20,
              paddingBottom: 10,
              borderRadius: 10,
              marginTop: 10,
            }}
          >
            {renderCheckbox('isInterestUseEBarimt')}
            {currentMap?.isInterestUseEBarimt && (
              <FormGroup>
                <ControlLabel>{__('Product')}</ControlLabel>
                {renderProductModal('interestEBarimtProduct')}
              </FormGroup>
            )}
          </div>
          <div
            style={{
              boxShadow: '1px 0px 5px rgba(0,0,0,0.1)',
              padding: 20,
              paddingBottom: 10,
              borderRadius: 10,
              marginTop: 10,
            }}
          >
            {renderCheckbox('isUndueUseEBarimt')}
            {currentMap?.isUndueUseEBarimt && (
              <FormGroup>
                <ControlLabel>{__('Product')}</ControlLabel>
                {renderProductModal('undueEBarimtProduct')}
              </FormGroup>
            )}
          </div>
        </CollapseContent>

        <CollapseContent title={__('Classification')}>
          {renderItem('normalExpirationDay', 'Normal /Expiration Day/', {
            type: 'number',
          })}
          {renderItem('expiredExpirationDay', 'Expired /Expiration Day/', {
            type: 'number',
          })}
          {renderItem('doubtExpirationDay', 'Doubt /Expiration Day/', {
            type: 'number',
          })}
          {renderItem('negativeExpirationDay', 'Negative /Expiration Day/', {
            type: 'number',
          })}
          {renderItem('badExpirationDay', 'Bad /Expiration Day/', {
            type: 'number',
          })}
        </CollapseContent>

        <CollapseContent title={__('Range config')}>
          {renderItem('minInterest', 'Min interest', {
            type: 'number',
          })}
          {renderItem('maxInterest', 'Max interest', {
            type: 'number',
          })}
          {renderItem('defaultInterest', 'Default interest', {
            type: 'number',
          })}
          {renderItem('minTenor', 'Min tenor /Month/', {
            type: 'number',
          })}
          {renderItem('maxTenor', 'Max tenor /Month/', {
            type: 'number',
          })}
          {renderItem('minAmount', 'Min amount', {
            type: 'number',
            useNumberFormat: true,
          })}
          {renderItem('maxAmount', 'Max amount', {
            type: 'number',
            useNumberFormat: true,
          })}
          {props.contractType?.leaseType === LEASE_TYPES.LINEAR &&
            renderItem('minCommitmentInterest', 'Min Commitment Interest', {
              type: 'number',
              useNumberFormat: true,
            })}
          {props.contractType?.leaseType === LEASE_TYPES.LINEAR &&
            renderItem('maxCommitmentInterest', 'Max Commitment Interest', {
              type: 'number',
              useNumberFormat: true,
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
};

export default GeneralSettings;
