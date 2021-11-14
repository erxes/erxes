import Button from 'modules/common/components/Button';
import { Step, Steps } from 'modules/common/components/step';
import {
  ControlWrapper,
  Indicator,
  StepWrapper
} from 'modules/common/components/step/styles';
import { __ } from 'modules/common/utils';
import Wrapper from 'modules/layout/components/Wrapper';
import React from 'react';
import { Link } from 'react-router-dom';
import FileUpload from './FileUpload';
import MapColumn from './MapColumn';

import { Content, LeftContent } from 'modules/settings/integrations/styles';
import { IAttachment } from 'modules/common/types';

type Props = {
  contentType: string;
};

type State = {
  attachments: IAttachment[];
};

class ExportForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      attachments: []
    };
  }

  onChangeAttachment = files => {
    this.setState({ attachments: files });
  };

  render() {
    const title = __('Import');

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Import & Export'), link: '/settings/importHistories' },
      { title }
    ];

    return (
      <StepWrapper>
        <Wrapper.Header title={title} breadcrumb={breadcrumb} />
        <Content>
          <LeftContent>
            <Steps active={1}>
              <Step img="/images/icons/erxes-10.svg" title="Upload">
                <FileUpload onChangeAttachment={this.onChangeAttachment} />
              </Step>
              <Step img="/images/icons/erxes-10.svg" title="Column">
                <MapColumn />
              </Step>
            </Steps>

            <ControlWrapper>
              <Indicator>
                {__('You are importing')}
                <strong> {this.props.contentType} </strong>
                {__('data')}
              </Indicator>
              <Button.Group>
                <Link to="settings/importHistories">
                  <Button btnStyle="simple" icon="times-circle">
                    Cancel
                  </Button>
                </Link>

                <Button btnStyle="success">Export</Button>
              </Button.Group>
            </ControlWrapper>
          </LeftContent>
        </Content>
      </StepWrapper>
    );
  }
}

export default ExportForm;
