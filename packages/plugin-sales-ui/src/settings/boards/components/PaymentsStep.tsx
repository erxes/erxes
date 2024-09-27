import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon,
  Tip,
  __,
} from '@erxes/ui/src';
import { LeftItem } from '@erxes/ui/src/components/step/styles';
import { FormColumn, FormWrapper } from '@erxes/ui/src/styles/main';
import { isEnabled, loadDynamicComponent } from '@erxes/ui/src/utils/core';
import React, { useState } from 'react';
import Select, { components } from 'react-select';
import styled from 'styled-components';
// import { Block, Description, FlexColumn, FlexItem } from '../../../styles';

import { PAYMENT_TYPE_ICONS } from '../../boards/constants';
import { IPipeline } from '@erxes/ui-sales/src/boards/types';
export const SelectValue = styled.div`
  display: flex;
  justify-content: left;
  align-items: baseline;
  margin-left: -7px;
  padding-left: 25px;
`;

type Props = {
  onChange: (name: string, value: any) => void;
  paymentIds?: string[];
  paymentTypes?: any[];
  erxesAppToken?: string;
};

const PaymentsStep = (props: Props) => {
  const { onChange, paymentIds, paymentTypes, erxesAppToken } = props;

  const onChangeFunction = (name: any, value: any) => {
    onChange(name, value);
  };

  const onChangePayments = ids => {
    onChangeFunction('paymentIds', ids);
  };

  const onChangeInput = e => {
    onChangeFunction(
      [e.target.id],
      (e.currentTarget as HTMLInputElement).value
    );
  };

  const onClickAddPayments = () => {
    const paymentTypes_ = [...(props.paymentTypes || [])];

    paymentTypes_.push({
      _id: Math.random().toString(),
      type: '',
      title: '',
      icon: '',
    });
    console.log('paumenttypes', paymentTypes_);
    onChange('paymentTypes', paymentTypes_);
  };

  const content = (option): React.ReactNode => (
    <>
      <Icon icon={option.avatar} />
      &nbsp;&nbsp;{option.label}
    </>
  );

  const selectItemRenderer = (option): React.ReactNode => {
    return <SelectValue>{content(option)}</SelectValue>;
  };

  const Option = props => {
    return (
      <components.Option {...props}>
        {selectItemRenderer(props.data)}
      </components.Option>
    );
  };

  const SingleValue = props => (
    <components.SingleValue {...props}>
      {selectItemRenderer(props.data)}
    </components.SingleValue>
  );

  const renderPaymentType = (paymentType: any) => {
    const editPayment = (name, value) => {
      let paymentTypes = [...(props.paymentTypes || [])];
      paymentTypes = (paymentTypes || []).map(p =>
        p._id === paymentType._id ? { ...p, [name]: value } : p
      );
      onChange('paymentTypes', paymentTypes);
    };

    const onChangeInput = e => {
      const name = e.target.name;
      const value = e.target.value;
      editPayment(name, value);
    };

    const onChangeSelect = option => {
      editPayment('icon', option.value);
    };

    const removePayment = () => {
      const paymentTypes =
        (props.paymentTypes || []).filter(m => m._id !== paymentType._id) || [];
      onChange('paymentTypes', paymentTypes);
    };

    const getTipText = type => {
      if (type === 'golomtCard') return 'continue';
      if (type === 'TDBCard' || type === 'capitron')
        return 'must config: "{port: 8078}"';
      if (type === 'khaanCard')
        return 'check localhost:27028 and contact databank';
      return '';
    };

    const iconOptions = PAYMENT_TYPE_ICONS.map(icon => ({
      value: icon,
      label: icon,
      avatar: `${icon}`,
    }));

    return (
      <div key={paymentType._id}>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <FormControl
                name='type'
                maxLength={10}
                defaultValue={paymentType.type || ''}
                onChange={onChangeInput}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <FormControl
                name='title'
                type='text'
                defaultValue={paymentType.title || ''}
                onChange={onChangeInput}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <Select
                name='icon'
                components={{ Option, SingleValue }}
                value={iconOptions.find(
                  o => o.value === (paymentType.icon || '')
                )}
                onChange={onChangeSelect}
                options={iconOptions}
                isClearable={false}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <Tip text={getTipText(paymentType.type)}>
                <FormControl
                  name='config'
                  type='text'
                  defaultValue={paymentType.config || ''}
                  onChange={onChangeInput}
                />
              </Tip>
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <Button
                btnStyle='danger'
                icon='trash'
                onClick={() => removePayment()}
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>
      </div>
    );
  };

  return (
    <div>
      {isEnabled('payment') && (
        <>
          {loadDynamicComponent('selectPayments', {
            defaultValue: props.paymentIds || [],
            onChange: (ids: string[]) => onChangePayments(ids),
          })}

          <div>
            <FormGroup>
              <ControlLabel>Erxes App Token:</ControlLabel>
              <FormControl
                id='erxesAppToken'
                type='text'
                value={props.erxesAppToken || ''}
                onChange={onChangeInput}
              />
            </FormGroup>
          </div>
        </>
      )}

      <div>
        <h4>{__('Other payments')}</h4>
        <div>
          type is must latin, some default types: golomtCard, khaanCard, TDBCard
        </div>
        <div>
          Хэрэв тухайн төлбөрт ебаримт хэвлэхгүй бол: "skipEbarimt: true",
          Харилцагч сонгосон үед л харагдах бол: "mustCustomer: true", Хэрэв
          хуваах боломжгүй бол: "notSplit: true" Урьдчилж төлсөн төлбөрөөр
          (Татвар тооцсон) бол: "preTax: true"
        </div>

        <FormGroup>
          <div key={Math.random()}>
            <FormWrapper>
              <FormColumn>
                <FormGroup>
                  <ControlLabel>Type</ControlLabel>
                </FormGroup>
              </FormColumn>
              <FormColumn>
                <FormGroup>
                  <ControlLabel>Title</ControlLabel>
                </FormGroup>
              </FormColumn>
              <FormColumn>
                <FormGroup>
                  <ControlLabel>Icon</ControlLabel>
                </FormGroup>
              </FormColumn>
              <FormColumn>
                <FormGroup>
                  <ControlLabel>Config</ControlLabel>
                </FormGroup>
              </FormColumn>
              <FormColumn></FormColumn>
            </FormWrapper>
          </div>
          {(props.paymentTypes || []).map(item => renderPaymentType(item))}
        </FormGroup>
        <Button
          btnStyle='primary'
          icon='plus-circle'
          onClick={onClickAddPayments}
        >
          Add payment
        </Button>
      </div>
    </div>
  );
};

export default PaymentsStep;
