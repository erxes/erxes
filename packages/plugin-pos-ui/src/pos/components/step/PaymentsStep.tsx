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
import { PAYMENT_TYPE_ICONS } from '../../../constants';
import { Block, Description, FlexColumn, FlexItem } from '../../../styles';
import { IPos, ISlot } from '../../../types';

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
  onChange: (name: 'pos', value: any) => void;
  pos: IPos;
  posSlots: ISlot[];
  envs: any;
};

type State = {
  slots: ISlot[];
};

class PaymentsStep extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      slots: props.posSlots || []
    };
  }

  onChangeFunction = (name: any, value: any) => {
    this.props.onChange(name, value);
  };

  onChangeSwitch = e => {
    const { pos } = this.props;

    if (pos[e.target.id]) {
      pos[e.target.id].isActive = e.target.checked;
    } else {
      pos[e.target.id] = { isActive: e.target.checked };
    }

    this.onChangeFunction('pos', pos);
  };

  onChangePayments = ids => {
    const { pos } = this.props;
    pos.paymentIds = ids;
    this.onChangeFunction('pos', pos);
  };

  onChangeInput = e => {
    const { pos } = this.props;
    pos[e.target.id] = (e.currentTarget as HTMLInputElement).value;
    this.onChangeFunction('pos', pos);
  };

  onClickAddPayments = () => {
    const { pos, onChange } = this.props;

    if (!pos.paymentTypes) {
      pos.paymentTypes = [];
    }

    pos.paymentTypes.push({
      _id: Math.random().toString(),
      type: '',
      title: '',
      icon: ''
    });

    onChange('pos', pos);
  };

  selectItemRenderer = (option): React.ReactNode => {
    return <SelectValue>{content(option)}</SelectValue>;
  };

  renderPaymentType(paymentType: any) {
    const { pos, onChange } = this.props;

    const editPayment = (name, value) => {
      pos.paymentTypes = (pos.paymentTypes || []).map(p =>
        p._id === paymentType._id ? { ...p, [name]: value } : p
      );
      onChange('pos', pos);
    };

    const onChangeInput = e => {
      const name = e.target.name;
      const value = e.target.value;
      editPayment(name, value);
    };

    const onChangeSelect = option => {
      console.log(option);
      editPayment('icon', option.value);
    };

    const removePayment = () => {
      const paymentTypes =
        (pos.paymentTypes || []).filter(m => m._id !== paymentType._id) || [];
      onChange('pos', { ...pos, paymentTypes });
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
    const { pos } = this.props;
    return (
      <FlexItem>
        <FlexColumn>
          <LeftItem>
            {isEnabled('payment') && (
              <>
                {loadDynamicComponent('extendFormOptions', {
                  defaultValue: pos.paymentIds || [],
                  onChange: (ids: string[]) => this.onChangePayments(ids)
                })}

                <Block>
                  <FormGroup>
                    <ControlLabel>Erxes App Token:</ControlLabel>
                    <FormControl
                      id="erxesAppToken"
                      type="text"
                      value={pos.erxesAppToken || ''}
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
                Хэрэв хуваах боломжгүй бол: "notSplit: true"
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
                {(pos.paymentTypes || []).map(item =>
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
          </LeftItem>
        </FlexColumn>
      </FlexItem>
    );
  }
}

export default PaymentsStep;
