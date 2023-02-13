import Modal from 'react-bootstrap/Modal';
import PosSlotItem from '../productGroup/PosSlotItem';
import React from 'react';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import {
  __,
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  Icon,
  ModalTrigger,
  Toggle
} from '@erxes/ui/src';
import { IPos, IScreenConfig, ISlot } from '../../../types';
import { LeftItem } from '@erxes/ui/src/components/step/styles';
import {
  Block,
  BlockRow,
  BlockRowUp,
  DomainRow,
  FlexColumn,
  FlexItem,
  PosSlotAddButton
} from '../../../styles';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import { loadDynamicComponent } from '@erxes/ui/src/utils/core';
import { FormColumn, FormWrapper } from '@erxes/ui/src/styles/main';
import { PAYMENT_TYPE_ICONS } from '../../../constants';
import Select from 'react-select-plus';
import styled from 'styled-components';

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
  onChange: (name: 'pos' | 'slots', value: any) => void;
  pos: IPos;
  posSlots: ISlot[];
  envs: any;
};

type State = {
  slots: ISlot[];
};

export const generateTree = (
  list,
  parentId,
  callback,
  level = -1,
  parentKey = 'parentId'
) => {
  const filtered = list.filter(c => c[parentKey] === parentId);

  if (filtered.length > 0) {
    level++;
  } else {
    level--;
  }

  return filtered.reduce((tree, node) => {
    return [
      ...tree,
      callback(node, level),
      ...generateTree(list, node._id, callback, level, parentKey)
    ];
  }, []);
};

class GeneralStep extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      slots: props.posSlots || []
    };
  }

  renderMapping(slot: ISlot, props) {
    const { slots } = this.state;

    const removeItem = (_id: string) => {
      const excluded = slots.filter(m => m._id !== _id);

      this.setState({ slots: excluded });
      this.props.onChange('slots', excluded);
    };

    const onChange = (changedSlot: ISlot) => {
      const excluded = slots.filter(m => m._id !== changedSlot._id);

      const updated = [...excluded, changedSlot];
      this.setState({ slots: updated });
      this.props.onChange('slots', updated);
    };

    return (
      <PosSlotItem
        key={slot._id || Math.random()}
        {...props}
        onChange={onChange}
        removeItem={removeItem}
        slot={slot}
      />
    );
  }

  renderPosSlotForm(trigger: React.ReactNode) {
    const { slots = [] } = this.state;

    const onClickAddSlot = () => {
      const m = slots.slice();

      m.push({
        _id: Math.random().toString(),
        code: '',
        name: '',
        posId: this.props.pos._id
      });

      this.setState({ slots: m });
    };

    const content = props => (
      <FormGroup>
        <PosSlotAddButton>
          <Button
            btnStyle="primary"
            icon="plus-circle"
            onClick={onClickAddSlot}
          >
            Add
          </Button>
        </PosSlotAddButton>
        {slots.map(s => this.renderMapping(s, props))}
        <Modal.Footer>
          <Button
            onClick={props.closeModal}
            btnStyle="success"
            icon={'plus-circle'}
          >
            {'Save'}
          </Button>
        </Modal.Footer>
      </FormGroup>
    );

    return (
      <ModalTrigger
        title={'Slots'}
        trigger={trigger}
        content={content}
        size={'lg'}
      />
    );
  }

  onChangeFunction = (name: any, value: any) => {
    this.props.onChange(name, value);
  };

  onChangeSwitchMain = e => {
    const { pos } = this.props;
    pos[e.target.id] = e.target.checked;

    this.onChangeFunction('pos', pos);
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

  renderWaitingScreen() {
    const { pos } = this.props;

    let waitingScreen: IScreenConfig = {
      isActive: false,
      type: 'time',
      value: 0,
      contentUrl: ''
    };

    let posId;

    if (pos) {
      waitingScreen = pos.waitingScreen || {
        isActive: false,
        type: 'time',
        value: 0,
        contentUrl: ''
      };
      posId = pos._id;
    }

    if (!waitingScreen.isActive) {
      return (
        <FormGroup>
          <DomainRow></DomainRow>
        </FormGroup>
      );
    }

    const onChangeType = e => {
      e.preventDefault();
      pos.waitingScreen.type = e.target.value;
      this.onChangeFunction('pos', pos);
    };

    const onChangeValue = e => {
      e.preventDefault();
      pos.waitingScreen.value = e.target.value;
      this.onChangeFunction('pos', pos);
    };

    const onChangeContentUrl = e => {
      e.preventDefault();
      pos.waitingScreen.contentUrl = e.target.value;
      this.onChangeFunction('pos', pos);
    };

    const typeOptions = [
      { label: 'Time', value: 'time' },
      { label: 'Count', value: 'count' }
    ];

    const valueTitle =
      waitingScreen.type === 'time' ? 'Change time (min)' : 'Change count';

    return (
      <FormGroup>
        <DomainRow>
          <ControlLabel>Change type</ControlLabel>
          <FormControl
            name="changeType"
            componentClass="select"
            placeholder={__('Select type')}
            defaultValue={waitingScreen.type}
            onChange={onChangeType}
            required={true}
          >
            <option />
            {typeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FormControl>

          <br />

          <ControlLabel>{valueTitle}</ControlLabel>

          <FormControl
            id="changeValue"
            type="text"
            value={waitingScreen.value}
            onChange={onChangeValue}
          />

          <br />
          <ControlLabel>Content Url</ControlLabel>

          <FormControl
            id="contentUrl"
            type="text"
            value={waitingScreen.contentUrl || ''}
            onChange={onChangeContentUrl}
          />
        </DomainRow>
      </FormGroup>
    );
  }

  renderKitchen() {
    const { pos } = this.props;

    let kitchenScreen = {
      isActive: false,
      type: 'time',
      value: 0
    };

    let posId;

    if (pos) {
      kitchenScreen = pos.kitchenScreen || {
        isActive: false,
        type: 'time',
        value: 0
      };
      posId = pos._id;
    }

    if (!kitchenScreen.isActive) {
      return (
        <FormGroup>
          <DomainRow></DomainRow>
        </FormGroup>
      );
    }

    const onChangeType = e => {
      e.preventDefault();
      pos.kitchenScreen.type = e.target.value;
      this.onChangeFunction('pos', pos);
    };

    const onChangeValue = e => {
      e.preventDefault();
      pos.kitchenScreen.value = e.target.value;
      this.onChangeFunction('pos', pos);
    };

    const typeOptions = [
      { label: 'Time', value: 'time' },
      { label: 'Manual', value: 'manual' }
    ];

    return (
      <FormGroup>
        <DomainRow>
          <ControlLabel>Status change</ControlLabel>
          <FormControl
            name="statusChange"
            componentClass="select"
            placeholder={__('Select type')}
            defaultValue={kitchenScreen.type}
            onChange={onChangeType}
            required={true}
          >
            <option />
            {typeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </FormControl>

          <br />

          {kitchenScreen.type === 'time' ? (
            <>
              <ControlLabel>Time (minute)</ControlLabel>
              <FormControl
                id="changeValue"
                type="text"
                value={kitchenScreen.value}
                onChange={onChangeValue}
              />
            </>
          ) : null}
        </DomainRow>
      </FormGroup>
    );
  }

  onChangeInput = e => {
    const { pos } = this.props;
    pos[e.target.id] = (e.currentTarget as HTMLInputElement).value;
    this.onChangeFunction('pos', pos);
  };

  renderCauseOnline() {
    const { pos } = this.props;
    if (pos.isOnline) {
      const onChangeMultiBranches = branchIds => {
        this.onChangeFunction('pos', {
          ...pos,
          allowBranchIds: branchIds
        });
      };

      return (
        <>
          <BlockRow>
            <FormGroup>
              <ControlLabel>Allow branches</ControlLabel>
              <SelectBranches
                label="Choose branch"
                name="allowBranchIds"
                initialValue={pos.allowBranchIds}
                onSelect={onChangeMultiBranches}
                multi={true}
              />
            </FormGroup>
          </BlockRow>
          <BlockRow>
            <FormGroup>
              <ControlLabel required={true}>Begin Number</ControlLabel>
              <FormControl
                id="beginNumber"
                maxLength={2}
                type="text"
                value={pos.beginNumber || ''}
                onChange={this.onChangeInput}
              />
            </FormGroup>
          </BlockRow>
        </>
      );
    }

    const onChangeBranches = branchId => {
      this.onChangeFunction('pos', { ...pos, branchId });
    };

    return (
      <>
        <h4>{__('Domain')}</h4>
        <BlockRow>
          <FormGroup>
            <ControlLabel>Waiting screen</ControlLabel>
            <Toggle
              id={'waitingScreen'}
              checked={
                pos && pos.waitingScreen ? pos.waitingScreen.isActive : false
              }
              onChange={this.onChangeSwitch}
              icons={{
                checked: <span>Yes</span>,
                unchecked: <span>No</span>
              }}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Kitchen screen</ControlLabel>
            <Toggle
              id={'kitchenScreen'}
              checked={
                pos && pos.kitchenScreen ? pos.kitchenScreen.isActive : false
              }
              onChange={this.onChangeSwitch}
              icons={{
                checked: <span>Yes</span>,
                unchecked: <span>No</span>
              }}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Choose branch</ControlLabel>
            <SelectBranches
              label="Choose branch"
              name="branchId"
              initialValue={pos.branchId}
              onSelect={onChangeBranches}
              customOption={{ value: '', label: 'No branch...' }}
              multi={false}
            />
          </FormGroup>
        </BlockRow>
        <BlockRowUp>
          {this.renderWaitingScreen()}
          {this.renderKitchen()}
        </BlockRowUp>
      </>
    );
  }

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
      pos.paymentTypes =
        (pos.paymentTypes || []).filter(m => m._id !== paymentType._id) || [];
      onChange('pos', pos);
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
    const { pos, envs } = this.props;

    const slotTrigger = (
      <div>
        Total slots: <button>{this.state.slots.length}</button>
      </div>
    );

    let name = 'POS name';
    let description: any = 'description';

    if (pos) {
      name = pos.name;
      description = pos.description;
    }

    const onChangeDepartments = departmentId => {
      this.onChangeFunction('pos', { ...pos, departmentId });
    };

    return (
      <FlexItem>
        <FlexColumn>
          <LeftItem>
            <Block>
              <h4>{__('Pos')}</h4>
              <BlockRow>
                <FormGroup>
                  <ControlLabel required={true}>Name</ControlLabel>
                  <FormControl
                    id="name"
                    type="text"
                    value={name || ''}
                    onChange={this.onChangeInput}
                  />
                </FormGroup>

                <FormGroup>
                  <ControlLabel>Description</ControlLabel>
                  <FormControl
                    id="description"
                    type="text"
                    value={description || ''}
                    onChange={this.onChangeInput}
                  />
                </FormGroup>
                <FormGroup>
                  <ControlLabel>Max Skip number</ControlLabel>
                  <FormControl
                    id="maxSkipNumber"
                    type="number"
                    min={0}
                    max={100}
                    value={pos.maxSkipNumber || 0}
                    onChange={this.onChangeInput}
                  />
                </FormGroup>
              </BlockRow>
            </Block>

            <Block>
              <BlockRow>
                <FormGroup>
                  <ControlLabel>Slots:</ControlLabel>
                </FormGroup>
                <FormGroup>{this.renderPosSlotForm(slotTrigger)}</FormGroup>
              </BlockRow>
            </Block>

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

            <Block>
              <h4>{__('Other payments')}</h4>
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

            <Block>
              <BlockRow>
                <FormGroup>
                  <ControlLabel>Is Online</ControlLabel>
                  <Toggle
                    id={'isOnline'}
                    checked={pos && pos.isOnline ? true : false}
                    onChange={this.onChangeSwitchMain}
                    icons={{
                      checked: <span>Yes</span>,
                      unchecked: <span>No</span>
                    }}
                  />
                </FormGroup>
                {(!envs || !envs.ALL_AUTO_INIT) && (
                  <FormGroup>
                    <ControlLabel>On Server</ControlLabel>
                    <Toggle
                      id={'onServer'}
                      checked={pos && pos.onServer ? true : false}
                      onChange={this.onChangeSwitchMain}
                      icons={{
                        checked: <span>Yes</span>,
                        unchecked: <span>No</span>
                      }}
                    />
                  </FormGroup>
                )}
                <FormGroup>
                  <ControlLabel>Choose department</ControlLabel>
                  <SelectDepartments
                    label="Choose department"
                    name="departmentId"
                    initialValue={pos.departmentId}
                    onSelect={onChangeDepartments}
                    multi={false}
                    customOption={{ value: '', label: 'No department...' }}
                  />
                </FormGroup>
              </BlockRow>
              {this.renderCauseOnline()}
            </Block>
          </LeftItem>
        </FlexColumn>
      </FlexItem>
    );
  }
}

export default GeneralStep;
