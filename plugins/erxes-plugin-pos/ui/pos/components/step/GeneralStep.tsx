import {
  __,
  FormGroup,
  ControlLabel,
  CollapseContent,
  FormControl,
  SelectTeamMembers,
  Toggle,
  getEnv,
  Button
} from 'erxes-ui';
import { LeftItem } from 'erxes-ui/lib/components/step/styles';
import React from 'react';
import { DomainRow, FlexColumn, FlexItem, Row } from '../../../styles';
import { IBrand } from 'erxes-ui/lib/products/types';
import SelectBrand from '../../containers/SelectBrand';
import { IIntegration, IPos } from '../../../types';
import Select from 'react-select-plus';

type Props = {
  onChange: (name: 'pos' | 'brand', value: any) => void;
  pos?: IPos;
  brand?: IBrand;
  formIntegrations: IIntegration[];
  currentMode: 'create' | 'update' | undefined;
};

class GeneralStep extends React.Component<Props, {}> {
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

    let waitingScreen = {
      isActive: false,
      type: 'time',
      value: 0
    };

    let posId;

    if (pos) {
      waitingScreen = pos.waitingScreen || {
        isActive: false,
        type: 'time',
        value: 0
      };
      posId = pos._id;
    }

    const { REACT_APP_API_URL } = getEnv();

    const typeOptions = [
      { label: 'Time', value: 'time' },
      { label: 'Count', value: 'count' }
    ];

    const valueTitle =
      waitingScreen.type === 'time' ? 'Change time (sec)' : 'Change count';

    return (
      <FormGroup>
        <ControlLabel>Waiting screen</ControlLabel>
        <Toggle
          id={'waitingScreen'}
          checked={waitingScreen.isActive}
          onChange={this.onChangeSwitch}
          icons={{
            checked: <span>Yes</span>,
            unchecked: <span>No</span>
          }}
        />
        <br />
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
          </DomainRow>
        )}
      </FormGroup>
    );
  }

  renderKiosk() {
    const { pos } = this.props;

    let kioskMachine = {
      isActive: false
    };

    let posId;

    if (pos) {
      kioskMachine = pos.kioskMachine || {
        isActive: false
      };
      posId = pos._id;
    }

    const { REACT_APP_API_URL } = getEnv();

    return (
      <FormGroup>
        <ControlLabel>Kiosk Machine</ControlLabel>
        <Toggle
          id={'kioskMachine'}
          checked={kioskMachine.isActive}
          onChange={this.onChangeSwitch}
          icons={{
            checked: <span>Yes</span>,
            unchecked: <span>No</span>
          }}
        />
        <br />
        {!kioskMachine.isActive ? null : (
          <DomainRow>
            <ControlLabel>Link</ControlLabel>
            <Row>
              <FormControl
                id="kioskLink"
                type="text"
                disabled={true}
                value={`${REACT_APP_API_URL}/pos/${posId}/kiosk`}
              />

              <Button>{__('Copy')}</Button>
            </Row>
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
        <ControlLabel>Kitchen screen</ControlLabel>
        <Toggle
          id={'kitchenScreen'}
          checked={kitchenScreen.isActive}
          onChange={this.onChangeSwitch}
          icons={{
            checked: <span>Yes</span>,
            unchecked: <span>No</span>
          }}
        />
        <br />
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

  render() {
    const { pos, brand, formIntegrations = [] } = this.props;

    const onChangeBrand = e => {
      this.onChangeFunction(
        'brand',
        (e.currentTarget as HTMLInputElement).value
      );
    };

    const onChangeInput = e => {
      pos[e.target.id] = (e.currentTarget as HTMLInputElement).value;
      this.onChangeFunction('pos', pos);
    };

    const onAdminSelect = users => {
      pos.adminIds = users;
      this.onChangeFunction('pos', pos);
    };

    const onCashierSelect = users => {
      pos.cashierIds = users;
      this.onChangeFunction('pos', pos);
    };

    const onChangeForms = values => {
      pos.formIntegrationIds = values.map(item => item.value) || [];
      this.onChangeFunction('pos', pos);
    };

    let name = 'POS name';
    let description = 'description';
    let cashierIds = [];
    let adminIds = [];

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
            <CollapseContent title="POS" open={true}>
              <FormGroup>
                <ControlLabel>Name</ControlLabel>
                <FormControl
                  id="name"
                  type="text"
                  value={name}
                  onChange={onChangeInput}
                />
              </FormGroup>

              <FormGroup>
                <ControlLabel>Description</ControlLabel>
                <FormControl
                  id="description"
                  componentClass="textarea"
                  value={description}
                  onChange={onChangeInput}
                />
              </FormGroup>

              <FormGroup>
                <SelectBrand
                  isRequired={true}
                  onChange={onChangeBrand}
                  defaultValue={brand ? brand._id : ' '}
                />
              </FormGroup>
            </CollapseContent>

            <CollapseContent title="Domain">
              {this.renderWaitingScreen()}
              {this.props.currentMode !== 'update' ? null : this.renderKiosk()}
              {this.renderKitchen()}
            </CollapseContent>

            <CollapseContent title="Features">
              <ControlLabel>Display name for form section</ControlLabel>
              <FormControl
                id="formSectionTitle"
                type="text"
                value={pos.formSectionTitle || ''}
                onChange={onChangeInput}
              />
              <br />
              <ControlLabel>Display name for form section</ControlLabel>
              <Select
                placeholder={__('Choose which forms to display')}
                value={pos.formIntegrationIds}
                onChange={onChangeForms}
                options={formIntegrations.map(e => ({
                  value: e._id,
                  label: e.name
                }))}
                multi={true}
              />
            </CollapseContent>

            <CollapseContent title="Permission">
              <FormGroup>
                <ControlLabel>POS admin</ControlLabel>
                <SelectTeamMembers
                  label={__('Choose team member')}
                  name="adminIds"
                  initialValue={adminIds}
                  onSelect={onAdminSelect}
                />
              </FormGroup>

              <FormGroup>
                <ControlLabel>POS cashier</ControlLabel>
                <SelectTeamMembers
                  label={__('Choose team member')}
                  name="cashierIds"
                  initialValue={cashierIds}
                  onSelect={onCashierSelect}
                />
              </FormGroup>
            </CollapseContent>
          </LeftItem>
        </FlexColumn>
      </FlexItem>
    );
  }
}

export default GeneralStep;
