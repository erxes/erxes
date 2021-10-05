import dayjs from 'dayjs';
import Icon from 'modules/common/components/Icon';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import Datetime from '@nateradebaugh/react-datetime';
import { __ } from 'modules/common/utils';

type Props = {
  config: any;
  triggerType: string;
  setConfig: (config: any) => void;
  inputName?: string;
};

export default class SelectDate extends React.Component<Props> {
  private overlay: any;

  onOverlayClose = () => {
    this.overlay.hide();
  };

  renderContent() {
    const { config, setConfig, inputName = 'value' } = this.props;

    const onDateChange = date => {
      config[inputName] = `${dayjs(date).format('YYYY-MM-DD, HH:mm:ss')}`;
      setConfig(config);
    };

    return (
      <Popover id="select-date-popover">
        <Datetime
          inputProps={{ placeholder: 'Click to select a date' }}
          dateFormat="YYYY/MM/DD"
          timeFormat="HH:mm"
          closeOnSelect={true}
          utc={true}
          input={false}
          value={config[inputName] || ''}
          onChange={onDateChange}
          defaultValue={dayjs()
            .startOf('day')
            .add(12, 'hour')
            .format('YYYY-MM-DD HH:mm:ss')}
        />
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
          {__('Date')} <Icon icon="angle-down" />
        </span>
      </OverlayTrigger>
    );
  }
}
