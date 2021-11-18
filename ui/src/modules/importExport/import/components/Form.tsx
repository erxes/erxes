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
import MapColumn from '../containers/MapColumn';

import { Content, LeftContent } from 'modules/settings/integrations/styles';
import { IAttachment } from 'modules/common/types';
import Details from './Details';

type Props = {
  contentType: string;
};

type State = {
  attachments: IAttachment[];
  columnWithChosenField: any;
  importName: string;
  disclaimer: boolean;
};

class ExportForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      attachments: [],
      columnWithChosenField: {},
      importName: '',
      disclaimer: false
    };
  }

  onChangeAttachment = files => {
    if (files[0]) {
      this.setState({ importName: files[0].name });
    }

    this.setState({ attachments: files });
  };

  onChangeColumn = (column, value) => {
    const { columnWithChosenField } = this.state;

    columnWithChosenField[column] = {};
    columnWithChosenField[column].value = value;

    this.setState({ columnWithChosenField });
  };

  onChangeImportName = value => {
    this.setState({ importName: value });
  };

  onChangeDisclaimer = value => {
    this.setState({ disclaimer: value });
  };

  renderImportButton = () =>
    this.state.disclaimer ? <Button btnStyle="success">Export</Button> : null;

  render() {
    const { contentType } = this.props;
    const {
      attachments,
      columnWithChosenField,
      importName,
      disclaimer
    } = this.state;

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
              <Step img="/images/icons/erxes-10.svg" title="Map">
                <MapColumn
                  contentType={contentType}
                  attachments={attachments}
                  columnWithChosenField={columnWithChosenField}
                  onChangeColumn={this.onChangeColumn}
                />
              </Step>

              <Step
                img="/images/icons/erxes-10.svg"
                title="Detail"
                noButton={true}
              >
                <Details
                  disclaimer={disclaimer}
                  importName={importName}
                  onChangeImportName={this.onChangeImportName}
                  onChangeDisclaimer={this.onChangeDisclaimer}
                />
              </Step>
            </Steps>

            <ControlWrapper>
              <Indicator>
                {__('You are importing')}
                <strong> {contentType} </strong>
                {__('data')}
              </Indicator>
              <Button.Group>
                <Link to="settings/importHistories">
                  <Button btnStyle="simple" icon="times-circle">
                    Cancel
                  </Button>
                </Link>

                {this.renderImportButton()}
              </Button.Group>
            </ControlWrapper>
          </LeftContent>
        </Content>
      </StepWrapper>
    );
  }
}

export default ExportForm;
