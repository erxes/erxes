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

import { Content, LeftContent } from 'modules/settings/integrations/styles';
import Details from './Details';
import { ITag } from 'modules/tags/types';
import SettingsForm from './SettingsForm';
import TypeForm from './TypeForm';
import AccociateForm from './AccociateForm';
import MapColumn from '../containers/MapColumn';

type Props = {
  contentType: string;
  addImportHistory: (doc: any) => void;
  tags: ITag[];
};

type State = {
  attachments: any;

  columnWithChosenField: any;
  importName: string;
  disclaimer: boolean;
  tagId: string;
  type: string;
  contentTypes: string[];
};

class ExportForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      attachments: {},
      columnWithChosenField: {},
      importName: '',
      disclaimer: false,
      tagId: '',
      type: 'single',
      contentTypes: []
    };
  }

  onChangeAttachment = (files, contentType) => {
    const { attachments } = this.state;

    const temp = { ...attachments };

    if (files[0]) {
      temp[contentType] = files;
    }

    this.setState({ attachments: temp });
  };

  onChangeColumn = (column, value, contentType) => {
    const { columnWithChosenField } = this.state;

    let temp = columnWithChosenField[contentType] || {};

    temp[column] = {};
    temp[column].value = value;

    const temp2 = columnWithChosenField || {};

    temp2[contentType] = temp;

    this.setState({ columnWithChosenField: temp2 });
  };

  onChangeImportName = value => {
    this.setState({ importName: value });
  };

  onChangeDisclaimer = value => {
    this.setState({ disclaimer: value });
  };

  onChangeTag = value => {
    this.setState({ tagId: value });
  };

  onChangeType = value => {
    this.setState({ type: value, contentTypes: [] });
  };

  onChangeContentType = value => {
    const { type, contentTypes } = this.state;

    if (type === 'single') {
      return this.setState({ contentTypes: [value] });
    }

    if (contentTypes.length === 2) {
      const temp = [...contentTypes];

      temp[0] = contentTypes[1];

      temp[1] = value;

      return this.setState({ contentTypes: temp });
    }

    const temp = [...contentTypes];

    temp.push(value);

    return this.setState({ contentTypes: temp });
  };

  onSubmit = () => {
    const {
      importName,
      columnWithChosenField,
      attachments,
      tagId,
      contentTypes
    } = this.state;

    const files = [] as any;

    for (const contentType of contentTypes) {
      if (attachments[contentType]) {
        const attachment = attachments[contentType];

        files.push(attachment[0]);
      }
    }

    const doc = {
      contentTypes: contentTypes,
      importName,
      files: attachments,
      columnsConfig: columnWithChosenField,
      tagId
    };

    return this.props.addImportHistory(doc);
  };

  renderImportButton = () =>
    this.state.disclaimer ? (
      <Button btnStyle="success" onClick={this.onSubmit}>
        Export
      </Button>
    ) : null;

  renderAssociateForm = () => {
    if (this.state.type === 'multi') {
      return (
        <Step img="/images/icons/erxes-10.svg" title="Upload">
          <AccociateForm />
        </Step>
      );
    }

    return;
  };

  renderMapColumn = () => {
    const { contentTypes, attachments, columnWithChosenField } = this.state;

    const result = [] as any;

    for (const contentType of contentTypes) {
      if (attachments[contentType]) {
        const attachment = attachments[contentType];

        result.push(
          <Step
            img="/images/icons/erxes-10.svg"
            title={`${contentType} mapping`}
          >
            <MapColumn
              contentType={contentType}
              attachments={attachment}
              columnWithChosenField={columnWithChosenField}
              onChangeColumn={this.onChangeColumn}
            />
          </Step>
        );
      }
    }

    return result;
  };

  render() {
    const { tags } = this.props;
    const { importName, disclaimer, tagId, type, contentTypes } = this.state;

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
              <Step img="/images/icons/erxes-10.svg" title="Type">
                <SettingsForm onChangeType={this.onChangeType} type={type} />
              </Step>
              <Step img="/images/icons/erxes-10.svg" title="Type">
                <TypeForm
                  onChangeContentType={this.onChangeContentType}
                  contentTypes={contentTypes}
                />
              </Step>
              <Step img="/images/icons/erxes-10.svg" title="Upload">
                <FileUpload
                  onChangeAttachment={this.onChangeAttachment}
                  contentTypes={contentTypes}
                  type={type}
                />
              </Step>

              {this.renderAssociateForm()}
              {this.renderMapColumn()}

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
                  tags={tags}
                  tagId={tagId}
                  onChangeTag={this.onChangeTag}
                />
              </Step>
            </Steps>

            <ControlWrapper>
              <Indicator />
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
