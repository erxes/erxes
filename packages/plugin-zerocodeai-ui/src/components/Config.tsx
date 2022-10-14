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
      apiKey: config.apiKey,
      projectName: config.projectName
    };
  }

  onChange = (key, e) => {
    this.setState({ [key]: e.target.value });
  };

  save = () => {
    const { apiKey, projectName } = this.state;

    this.props.save({
      apiKey,
      projectName
    });
  };

  render() {
    const { apiKey, projectName } = this.state;

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

        <FormGroup>
          <ControlLabel required={true}>Project name</ControlLabel>
          <FormControl
            onChange={this.onChange.bind(this, 'projectName')}
            name="projectName"
            value={projectName}
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
