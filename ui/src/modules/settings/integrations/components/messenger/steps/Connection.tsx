import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { FlexItem, LeftItem } from 'modules/common/components/step/styles';
import { __ } from 'modules/common/utils';
import SelectBrand from 'modules/settings/integrations/containers/SelectBrand';
import SelectChannels from 'modules/settings/integrations/containers/SelectChannels';
import { IMessages } from 'modules/settings/integrations/types';
import React from 'react';

type Props = {
  onChange: (name: any, value: any) => void;
  title?: string;
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

  channelOnChange = (values: string[]) =>
    this.onChangeFunction('channelIds', values);

  onChangeTitle = e =>
    this.props.onChange('title', (e.currentTarget as HTMLInputElement).value);

  render() {
    return (
      <FlexItem>
        <LeftItem>
          <FormGroup>
            <ControlLabel>Integration Name</ControlLabel>
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
            description={__(
              'In which Channel(s) do you want to add this integration?'
            )}
          />
        </LeftItem>
      </FlexItem>
    );
  }
}

export default Connection;
