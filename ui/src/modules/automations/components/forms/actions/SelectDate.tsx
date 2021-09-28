import dayjs from 'dayjs';
import { CalenderWrapper } from 'modules/boards/styles/popup';
import Icon from 'modules/common/components/Icon';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';

import Datetime from '@nateradebaugh/react-datetime';

import { Attributes } from './styles';

type Props = {
  config: any;
  triggerType: string;
  setConfig: (config: any) => void;
  inputName?: string;
};

export default class SelectDate extends React.Component<Props> {
  private overlay: any;

  hideContent = () => {
    this.overlay.hide();
  };

  dateOnChange = date => {
    this.overlay && this.overlay.hide();
    const { config, setConfig, inputName = 'value' } = this.props;
    config[inputName] = `${dayjs(date).format('YYYY/MM/DD, HH:mm:ss')}`;
    setConfig(config);
  };

  renderContent() {
    return (
      <Popover id="select-date-popover">
        <Attributes>
          <React.Fragment>
            <li>
              <b>Choose date</b>
            </li>
            <CalenderWrapper>
              <Datetime
                dateFormat="YYYY/MM/DD"
                timeFormat="HH:mm"
                value={new Date()}
                closeOnSelect={true}
                utc={true}
                input={false}
                onChange={this.dateOnChange}
                defaultValue={dayjs()
                  .startOf('day')
                  .add(12, 'hour')
                  .format('YYYY-MM-DD HH:mm:ss')}
              />
            </CalenderWrapper>
          </React.Fragment>
        </Attributes>
      </Popover>
    );
  }

  render() {
    return (
      <OverlayTrigger
        ref={overlay => {
          this.overlay = overlay;
        }}
        trigger="click"
        placement="top"
        overlay={this.renderContent()}
        rootClose={true}
        container={this}
      >
        <span>
          Date <Icon icon="angle-down" />
        </span>
      </OverlayTrigger>
    );
  }
}
