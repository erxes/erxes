import React from 'react';
import styled from 'styled-components';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import { __ } from 'coreui/utils';
import Button from '@erxes/ui/src/components/Button';
import Uploader from '@erxes/ui/src/components/Uploader';
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
  save: any;
};

class Train extends React.Component<Props, any> {
  constructor(props) {
    super(props);

    this.state = {
      file: ''
    };
  }

  onChangeFile = e => {
    this.setState({ file: e[0].url });
  };

  save = () => {
    const { file } = this.state;

    this.props.save({
      file
    });
  };

  render() {
    const { file } = this.state;

    const content = (
      <ContentBox>
        <FormGroup>
          <ControlLabel required={true}>Upload a training data</ControlLabel>

          <Uploader
            defaultFileList={file ? [file] : []}
            onChange={this.onChangeFile}
            single={true}
          />
        </FormGroup>

        <Button onClick={this.save}>Save training data</Button>
      </ContentBox>
    );

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Zerocode AI'), link: '/zerocodeai/train' }
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

export default Train;
