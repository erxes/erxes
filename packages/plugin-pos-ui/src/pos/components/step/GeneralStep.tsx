import {
  __,
  FormGroup,
  ControlLabel,
  FormControl,
  SelectTeamMembers,
  Toggle,
  getEnv,
  Button,
  ModalTrigger
} from '@erxes/ui/src';
import { LeftItem } from '@erxes/ui/src/components/step/styles';
import React from 'react';
import {
  DomainRow,
  FlexColumn,
  FlexItem,
  Row,
  Block,
  BlockRow,
  BlockRowUp,
  PosSlotAddButton
} from '../../../styles';
import { IPos, IScreenConfig, ISlot } from '../../../types';
import Select from 'react-select-plus';
import PosSlotItem from '../productGroup/PosSlotItem';
import Modal from 'react-bootstrap/Modal';

type Props = {
  onChange: (name: 'pos' | 'slots', value: any) => void;
  pos: IPos;
  currentMode: 'create' | 'update';
  branches: any[];
  posSlots: ISlot[];
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

  onChangeConfig = (code: string, value) => {
    this.setState({}, () => {});
  };

  onChangeCheckbox = (code: string, e) => {
    this.onChangeConfig(code, e.target.checked);
  };

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

  onChangeSwitchIsOnline = e => {
    const { pos } = this.props;
    pos.isOnline = e.target.checked;

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

  renderWaitingScreen() {
    const { pos } = this.props;

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

    const { REACT_APP_API_URL } = getEnv();

    const typeOptions = [
      { label: 'Time', value: 'time' },
      { label: 'Count', value: 'count' }
    ];

    const valueTitle =
      waitingScreen.type === 'time' ? 'Change time (min)' : 'Change count';

    return (
      <FormGroup>
        {!waitingScreen.isActive ? null : (
          <DomainRow>
            {this.props.currentMode !== 'update' ? null : (
              <>
                <ControlLabel>Link</ControlLabel>
                <Row>
                  <FormControl
                    id="waitingLink"
                    type="text"
                    disabled={true}
                    value={`${REACT_APP_API_URL}/pos/${posId}/waiting`}
                  />

                  <Button>{__('Copy')}</Button>
                </Row>{' '}
              </>
            )}
            <br />
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
        )}
      </FormGroup>
    );
  }

  renderKitchen() {
    const { pos } = this.props;

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

    const { REACT_APP_API_URL } = getEnv();

    const typeOptions = [
      { label: 'Time', value: 'time' },
      { label: 'Manual', value: 'manual' }
    ];

    return (
      <FormGroup>
        {!kitchenScreen.isActive ? null : (
          <DomainRow>
            {this.props.currentMode !== 'update' ? null : (
              <>
                <ControlLabel>Link</ControlLabel>
                <Row>
                  <FormControl
                    id="kitchenLink"
                    type="text"
                    disabled={true}
                    value={`${REACT_APP_API_URL}/pos/${posId}/kitchen`}
                  />

                  <Button>{__('Copy')}</Button>
                </Row>{' '}
              </>
            )}

            <br />
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
        )}
      </FormGroup>
    );
  }

  onChangeInput = e => {
    const { pos } = this.props;
    pos[e.target.id] = (e.currentTarget as HTMLInputElement).value;
    this.onChangeFunction('pos', pos);
  };

  renderCauseOnline() {
    const { pos, branches } = this.props;
    if (pos.isOnline) {
      const onChangeMultiBranches = ops => {
        const selectedOptionsValues = ops.map(option => option.value);

        this.onChangeFunction('pos', {
          ...pos,
          allowBranchIds: selectedOptionsValues
        });
      };

      return (
        <>
          <BlockRow>
            <FormGroup>
              <ControlLabel>Allow branches</ControlLabel>
              <Select
                placeholder={__('Choose parent')}
                value={pos.allowBranchIds || []}
                clearable={true}
                onChange={onChangeMultiBranches}
                options={generateTree(branches || [], null, (node, level) => ({
                  value: node._id,
                  label: `${'---'.repeat(level)} ${node.title}`
                }))}
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

    const onChangeBranches = opt => {
      this.onChangeFunction('pos', { ...pos, branchId: opt.value });
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
            <Select
              placeholder={__('Choose parent')}
              value={pos.branchId}
              clearable={true}
              onChange={onChangeBranches}
              options={generateTree(branches || [], null, (node, level) => ({
                value: node._id,
                label: `${'---'.repeat(level)} ${node.title}`
              }))}
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

  renderCheckbox = (key: string, title?: string, description?: string) => {
    return (
      <>
        {description && <p>{__(description)}</p>}

        <FormControl
          onChange={this.onChangeCheckbox.bind(this, key)}
          componentClass="checkbox"
        />
        <ControlLabel>{title || key}</ControlLabel>
      </>
    );
  };

  render() {
    const { pos } = this.props;

    const slotTrigger = (
      <div>
        Total slots: <button>{this.state.slots.length}</button>
      </div>
    );

    const onAdminSelect = users => {
      pos.adminIds = users;
      this.onChangeFunction('pos', pos);
    };

    const onCashierSelect = users => {
      pos.cashierIds = users;
      this.onChangeFunction('pos', pos);
    };

    let name = 'POS name';
    let description: any = 'description';
    let cashierIds: any = [];
    let adminIds: any = [];

    if (pos) {
      name = pos.name;
      description = pos.description;
      cashierIds = pos.cashierIds;
      adminIds = pos.adminIds;
    }

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
                <FormGroup>{this.renderCheckbox('Slot Required')}</FormGroup>
                <FormGroup>{this.renderPosSlotForm(slotTrigger)}</FormGroup>
              </BlockRow>
            </Block>

            <Block>
              <h4>{__('Permission')}</h4>
              <BlockRow>
                <FormGroup>
                  <ControlLabel required={true}>POS admin</ControlLabel>
                  <SelectTeamMembers
                    label={__('Choose team member')}
                    name="adminIds"
                    initialValue={adminIds}
                    onSelect={onAdminSelect}
                  />
                </FormGroup>

                <FormGroup>
                  <ControlLabel required={true}>POS cashier</ControlLabel>
                  <SelectTeamMembers
                    label={__('Choose team member')}
                    name="cashierIds"
                    initialValue={cashierIds}
                    onSelect={onCashierSelect}
                  />
                </FormGroup>
              </BlockRow>
            </Block>

            <Block>
              <ControlLabel>Is Online</ControlLabel>
              <Toggle
                id={'isOnline'}
                checked={pos && pos.isOnline ? true : false}
                onChange={this.onChangeSwitchIsOnline}
                icons={{
                  checked: <span>Yes</span>,
                  unchecked: <span>No</span>
                }}
              />
              {this.renderCauseOnline()}
            </Block>
          </LeftItem>
        </FlexColumn>
      </FlexItem>
    );
  }
}

export default GeneralStep;
