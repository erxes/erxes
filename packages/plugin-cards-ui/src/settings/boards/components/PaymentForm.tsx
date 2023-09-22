import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon,
  Tip,
  __
} from '@erxes/ui/src';
import { LeftItem } from '@erxes/ui/src/components/step/styles';
import { FormColumn, FormWrapper } from '@erxes/ui/src/styles/main';
import { isEnabled, loadDynamicComponent } from '@erxes/ui/src/utils/core';
import React from 'react';
import Select from 'react-select-plus';
import styled from 'styled-components';
import { PAYMENT_TYPE_ICONS } from '../constants';
import { Block, Description, FlexColumn, FlexItem } from '../styles';
import { IPaymentType } from '../types';

export const SelectValue = styled.div`
  display: flex;
  justify-content: left;
  align-items: baseline;
  margin-left: -7px;
  padding-left: 25px;
`;

const content = (option): React.ReactNode => (
  <>
    <Icon icon={option.avatar} />
    &nbsp;&nbsp;{option.label}
  </>
);

type Props = {
  onChange: (name: 'payment', value: any) => void;
  payment: any;
  paymentSave: (value: IPaymentType) => void;
};

type State = {};

class PaymentForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {};
  }
  handleSubmit = () => {
    const { payment, paymentSave } = this.props;
    paymentSave(payment);
  };

  onChangeFunction = (name: any, value: any) => {
    this.props.onChange(name, value);
  };

  onChangePayments = ids => {
    const { payment } = this.props;
    this.onChangeFunction('payment', { ...payment, paymentIds: ids });
  };

  onChangeInput = e => {
    const { payment } = this.props;
    this.onChangeFunction('payment', {
      ...payment,
      [e.target.id]: (e.currentTarget as HTMLInputElement).value
    });
  };

  onClickAddPayments = () => {
    const { payment, onChange } = this.props;
    const paymentTypes = [...(payment.paymentTypes || [])];
    paymentTypes.push({
      _id: Math.random().toString(),
      type: '',
      title: '',
      icon: ''
    });

    onChange('payment', { ...payment, paymentTypes });
  };

  selectItemRenderer = (option): React.ReactNode => {
    return <SelectValue>{content(option)}</SelectValue>;
  };

  renderPaymentType(paymentType: any) {
    const { payment, onChange } = this.props;

    const editPayment = (name, value) => {
      let paymentTypes = [...(payment.paymentTypes || [])];
      paymentTypes = (paymentTypes || []).map(p =>
        p._id === paymentType._id ? { ...p, [name]: value } : p
      );
      onChange('payment', { ...payment, paymentTypes });
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
        (payment.paymentTypes || []).filter(m => m._id !== paymentType._id) ||
        [];
      onChange('payment', { ...payment, paymentTypes });
    };

    const getTipText = type => {
      if (type === 'golomtCard') return 'continue';
      if (type === 'TDBCard') return 'must config: "{port: 8078}"';
      if (type === 'khaanCard')
        return 'check localhost:27028 and contact databank';
      return '';
    };

    return (
      <div key={paymentType._id}>
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <FormControl
                name="type"
                maxLength={10}
                defaultValue={paymentType.type || ''}
                onChange={onChangeInput}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <FormControl
                name="title"
                type="text"
                defaultValue={paymentType.title || ''}
                onChange={onChangeInput}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <Select
                name="icon"
                componentClass="select"
                optionRenderer={this.selectItemRenderer}
                valueRenderer={this.selectItemRenderer}
                value={paymentType.icon || ''}
                onChange={onChangeSelect}
                options={PAYMENT_TYPE_ICONS.map(icon => ({
                  value: icon,
                  label: icon,
                  avatar: `${icon}`
                }))}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <Tip text={getTipText(paymentType.type)}>
                <FormControl
                  name="config"
                  type="text"
                  defaultValue={paymentType.config || ''}
                  onChange={onChangeInput}
                />
              </Tip>
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <Button
                btnStyle="danger"
                icon="trash"
                onClick={() => removePayment()}
              />
            </FormGroup>
          </FormColumn>
        </FormWrapper>
      </div>
    );
  }

  render() {
    const { payment } = this.props;
    return (
      <FlexItem>
        <FlexColumn>
          <LeftItem>
            {isEnabled('payment') && (
              <>
                {loadDynamicComponent('selectPayments', {
                  defaultValue: payment.paymentIds || [],
                  onChange: (ids: string[]) => this.onChangePayments(ids)
                })}

                <Block>
                  <FormGroup>
                    <ControlLabel>Erxes App Token:</ControlLabel>
                    <FormControl
                      id="erxesAppToken"
                      type="text"
                      value={payment.erxesAppToken || ''}
                      onChange={this.onChangeInput}
                    />
                  </FormGroup>
                </Block>
              </>
            )}

            <Block>
              <h4>{__('Other payments')}</h4>
              <Description>
                type is must latin, some default types: golomtCard, khaanCard,
                TDBCard
              </Description>
              <Description>
                Хэрэв тухайн төлбөрт ебаримт хэвлэхгүй бол: "skipEbarimt: true",
                Харилцагч сонгосон үед л харагдах бол: "mustCustomer: true",
                Хэрэв хуваах боломжгүй бол: "notSplit: true" Урьдчилж төлсөн
                төлбөрөөр (Татвар тооцсон) бол: "preTax: true"
              </Description>
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
                {(payment.paymentTypes || []).map(item =>
                  this.renderPaymentType(item)
                )}
              </FormGroup>
              <Button
                btnStyle="primary"
                icon="plus-circle"
                onClick={this.onClickAddPayments}
              >
                Add payment
              </Button>
            </Block>
            <Button
              btnStyle="success"
              style={{
                marginRight: '10px',
                float: 'right'
              }}
              onClick={this.handleSubmit}
              icon="checked-1"
            >
              Save
            </Button>
          </LeftItem>
        </FlexColumn>
      </FlexItem>
    );
  }
}

export default PaymentForm;
