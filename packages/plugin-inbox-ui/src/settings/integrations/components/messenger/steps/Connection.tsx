import { FlexItem, LeftItem } from '@erxes/ui/src/components/step/styles';

import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { IMessages } from '../../../types';
import React from 'react';
import SelectBrand from '../../../containers/SelectBrand';
import SelectChannels from '../../../containers/SelectChannels';
import Toggle from '@erxes/ui/src/components/Toggle';
import { __ } from 'coreui/utils';

type Props = {
  onChange: (name: any, value: any) => void;
  title?: string;
  botEndpointUrl?: string;
  botShowInitialMessage?: boolean;
  brandId?: string;
  channelIds?: string[];
};

type State = {
  messages: IMessages;
};

class Connection extends React.Component<Props, State> {
  onChangeFunction = (name, value) => {
    this.props.onChange(name, value);
  };

  brandOnChange = e => this.onChangeFunction('brandId', e.target.value);

  handleToggle = e =>
    this.onChangeFunction('botShowInitialMessage', e.target.checked);

  channelOnChange = (values: string[]) =>
    this.onChangeFunction('channelIds', values);

  changeBotEndpointUrl = e => {
    this.props.onChange(
      'botEndpointUrl',
      (e.currentTarget as HTMLInputElement).value
    );
  };

  onChangeTitle = e =>
    this.props.onChange('title', (e.currentTarget as HTMLInputElement).value);

  render() {
    return (
      <FlexItem>
        <LeftItem>
          <FormGroup>
            <ControlLabel required={true}>Integration Name</ControlLabel>
            <p>{__('Name this integration to differentiate from the rest')}</p>

            <FormControl
              required={true}
              onChange={this.onChangeTitle}
              defaultValue={this.props.title}
            />
          </FormGroup>

          <SelectBrand
            defaultValue={this.props.brandId}
            isRequired={true}
            onChange={this.brandOnChange}
            description={__(
              'Which specific Brand does this integration belong to?'
            )}
          />

          <SelectChannels
            defaultValue={this.props.channelIds}
            isRequired={true}
            onChange={this.channelOnChange}
          />

          <FormGroup>
            <ControlLabel>Bot Press Endpoint URL</ControlLabel>
            <p>{__('Please enter your Bot Press endpoint URL')}</p>

            <FormControl
              required={false}
              onChange={this.changeBotEndpointUrl}
              defaultValue={this.props.botEndpointUrl}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Bot show initial message</ControlLabel>
            <p>{__('Please build initial message in BotPress builder')}</p>

            <Toggle
              checked={this.props.botShowInitialMessage}
              onChange={this.handleToggle}
              icons={{
                checked: <span>{__('Yes')}</span>,
                unchecked: <span>{__('No')}</span>
              }}
            />
          </FormGroup>
        </LeftItem>
      </FlexItem>
    );
  }
}

export default Connection;
