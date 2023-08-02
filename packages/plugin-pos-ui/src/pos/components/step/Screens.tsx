import React from 'react';
import { IPos, IScreenConfig } from '../../../types';
import {
  __,
  ControlLabel,
  FormControl,
  FormGroup,
  Toggle
} from '@erxes/ui/src';
import {
  Block,
  BlockRow,
  BlockRowUp,
  FlexColumn,
  FlexItem,
  DomainRow
} from '../../../styles';
import { LeftItem } from '@erxes/ui/src/components/step/styles';

type Props = {
  onChange: (name: 'pos', value: any) => void;
  pos: IPos;
  checkRemainder: boolean;
};

class ScreensConfig extends React.Component<
  Props,
  { config: any; checkRemainder: boolean }
> {
  constructor(props: Props) {
    super(props);

    const { pos, checkRemainder } = props;
    const config =
      pos && pos.erkhetConfig
        ? pos.erkhetConfig
        : {
            isSyncErkhet: false,
            userEmail: '',
            defaultPay: '',
            getRemainder: false
          };

    this.state = {
      config,
      checkRemainder
    };
  }

  renderWaitingScreen() {
    const { pos } = this.props;

    let waitingScreen: IScreenConfig = {
      isActive: false,
      type: 'time',
      value: 0,
      contentUrl: ''
    };

    if (pos) {
      waitingScreen = pos.waitingScreen || {
        isActive: false,
        type: 'time',
        value: 0,
        contentUrl: ''
      };
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
      this.props.onChange('pos', {
        ...pos,
        waitingScreen: {
          ...waitingScreen,
          type: e.target.value
        }
      });
    };

    const onChangeValue = e => {
      e.preventDefault();
      this.props.onChange('pos', {
        ...pos,
        waitingScreen: {
          ...waitingScreen,
          value: e.target.value
        }
      });
    };

    const onChangeContentUrl = e => {
      e.preventDefault();
      this.props.onChange('pos', {
        ...pos,
        waitingScreen: {
          ...waitingScreen,
          contentUrl: e.target.value
        }
      });
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

    if (pos) {
      kitchenScreen = pos.kitchenScreen || {
        isActive: false,
        type: 'time',
        value: 0
      };
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
      this.props.onChange('pos', {
        ...pos,
        kitchenScreen: {
          ...kitchenScreen,
          type: e.target.value
        }
      });
    };

    const onChangeValue = e => {
      e.preventDefault();
      this.props.onChange('pos', {
        ...pos,
        kitchenScreen: {
          ...kitchenScreen,
          value: e.target.value
        }
      });
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

  onChangeSwitch = e => {
    const { pos } = this.props;

    this.props.onChange('pos', {
      ...pos,
      [e.target.id]: { ...pos[e.target.id], isActive: e.target.checked }
    });
  };

  render() {
    const { pos } = this.props;
    return (
      <FlexItem>
        <FlexColumn>
          <LeftItem>
            <Block>
              <h4>{__('Main')}</h4>
              <BlockRow>
                <FormGroup>
                  <ControlLabel>Kitchen screen</ControlLabel>
                  <Toggle
                    id={'kitchenScreen'}
                    checked={
                      pos && pos.kitchenScreen
                        ? pos.kitchenScreen.isActive
                        : false
                    }
                    onChange={this.onChangeSwitch}
                    icons={{
                      checked: <span>Yes</span>,
                      unchecked: <span>No</span>
                    }}
                  />
                </FormGroup>
                <FormGroup>
                  <ControlLabel>Waiting screen</ControlLabel>
                  <Toggle
                    id={'waitingScreen'}
                    checked={
                      pos && pos.waitingScreen
                        ? pos.waitingScreen.isActive
                        : false
                    }
                    onChange={this.onChangeSwitch}
                    icons={{
                      checked: <span>Yes</span>,
                      unchecked: <span>No</span>
                    }}
                  />
                </FormGroup>
              </BlockRow>
              <BlockRowUp>
                {this.renderKitchen()}
                {this.renderWaitingScreen()}
              </BlockRowUp>
            </Block>

            <Block />
          </LeftItem>
        </FlexColumn>
      </FlexItem>
    );
  }
}

export default ScreensConfig;
