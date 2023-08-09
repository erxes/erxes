import Modal from 'react-bootstrap/Modal';
import Select from 'react-select-plus';
import PosSlotItem from '../productGroup/PosSlotItem';
import React from 'react';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import {
  __,
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  ModalTrigger,
  Toggle
} from '@erxes/ui/src';
import { IPos, ISlot } from '../../../types';
import { LeftItem } from '@erxes/ui/src/components/step/styles';
import {
  Block,
  BlockRow,
  FlexColumn,
  FlexItem,
  FlexRow,
  PosSlotAddButton
} from '../../../styles';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import { ALLOW_TYPES } from '../../../constants';

type Props = {
  onChange: (name: 'pos' | 'slots' | 'allowTypes', value: any) => void;
  pos: IPos;
  posSlots: ISlot[];
  allowTypes: string[];
  envs: any;
};

type State = {
  slots: ISlot[];
  allowTypes: string[];
};

class GeneralStep extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      slots: props.posSlots || [],
      allowTypes: props.allowTypes
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
      const updated = slots.map(s =>
        s._id === changedSlot._id ? { ...s, ...changedSlot } : s
      );
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
        <Block>
          <FlexRow key={Math.random()}>
            <FormGroup>
              <FormControl value={'CODE'} />
            </FormGroup>
            <FormGroup>
              <FormControl value={'NAME'} />
            </FormGroup>
          </FlexRow>
        </Block>
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

    this.onChangeFunction('pos', { ...pos, [e.target.id]: e.target.checked });
  };

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
              <ControlLabel required={true}>Pos domain</ControlLabel>
              <FormControl
                id="pdomain"
                type="text"
                value={pos.pdomain || ''}
                onChange={this.onChangeInput}
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
        <BlockRow>
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
      </>
    );
  }

  renderToggleType() {
    const { allowTypes } = this.state;

    const onChange = (i: number, option) => {
      const newTypes = [...allowTypes];
      const preChosenInd = allowTypes.indexOf(option.value);
      if (preChosenInd >= 0) {
        newTypes[preChosenInd] = '';
      }

      newTypes[i] = option.value;
      this.setState({ allowTypes: newTypes }, () => {
        this.props.onChange('allowTypes', newTypes);
      });
    };

    const chosenTypes: string[] = [];
    const result: any[] = [];
    for (var i = 0; i < ALLOW_TYPES.length; i++) {
      const currentCh = (allowTypes || [])[i] || '';

      result.push(
        <Select
          key={i}
          index={i}
          options={(i !== 0 ? [{ value: '', label: 'Null' }] : []).concat(
            ALLOW_TYPES.filter(at => !chosenTypes.includes(at.value))
          )}
          value={currentCh}
          onChange={onChange.bind(this, i)}
        />
      );
      chosenTypes.push(currentCh);
    }
    return result;
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
            <Block>
              <BlockRow>
                <FormGroup>
                  <ControlLabel>Types:</ControlLabel>
                </FormGroup>
              </BlockRow>
              <BlockRow>{this.renderToggleType()}</BlockRow>
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
