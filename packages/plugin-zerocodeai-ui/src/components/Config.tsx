import React from 'react';
import styled from 'styled-components';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from 'coreui/utils';
import Button from '@erxes/ui/src/components/Button';
import {
  ControlLabel,
  FormControl,
  FormGroup
} from '@erxes/ui/src/components/form';

export const ContentBox = styled.div`
  max-width: 640px;
  margin: 0 auto;
`;

type Props = {
  config: any;
  save: any;
};

class Config extends React.Component<Props, any> {
  constructor(props) {
    super(props);

    const { config } = props;

    this.state = {
      apiKey: config.apiKey
    };
  }

  onChange = (key, e) => {
    this.setState({ [key]: e.target.value });
  };

  save = () => {
    const { apiKey } = this.state;

    this.props.save({
      apiKey
    });
  };

  render() {
    const { apiKey } = this.state;

    const content = (
      <ContentBox>
        <FormGroup>
          <ControlLabel required={true}>Api key</ControlLabel>
          <FormControl
            onChange={this.onChange.bind(this, 'apiKey')}
            name="apiKey"
            value={apiKey}
            required={true}
            autoFocus={true}
          />
        </FormGroup>

        <Button onClick={this.save}>Save</Button>
      </ContentBox>
    );

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Zerocode AI'), link: '/zerocodeai/config' }
    ];

    return (
      <Wrapper
        header={
          <Wrapper.Header title={__('Zerocode AI')} breadcrumb={breadcrumb} />
        }
        content={content}
      />
    );
  }
}

export default Config;
