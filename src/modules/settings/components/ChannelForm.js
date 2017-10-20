import React from 'react';
import { FormGroup, ControlLabel, FormControl } from 'react-bootstrap';
import { Tip } from '../../common';
import { Form as CommonForm } from '../common/components';

class ChannelForm extends CommonForm {
  constructor(props) {
    super(props);

    this.collectValues = this.collectValues.bind(this);

  }

  collectValues(items) {
    return items.map(item => item.value);
  }

  renderChannelTip(channels) {
    const array = channels || [];
    const count = array.length;
    if (count !== 0) {
      const channelNames = array.map(c => c.name);
      return (
        <Tip text={channelNames.toString()}>
          <div className="channel-round">
            <span>{count}</span>
          </div>
        </Tip>
      );
    }
    return null;
  }

  renderContent() {
    const { object } = this.props;
    const channel = object || { memberIds: [], integrationIds: [] };

    return (
      <div>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>

          <FormControl id="channel-name" defaultValue={channel.name} type="text" required />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Description</ControlLabel>

          <FormControl
            id="channel-description"
            componentClass="textarea"
            rows={5}
            defaultValue={channel.description}
          />
        </FormGroup>

      </div>
    );
  }
}

export default ChannelForm;
