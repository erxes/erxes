import Button from '@erxes/ui/src/components/Button';
import FullPreview from './step/FullPreview';
import { Step, Steps } from '@erxes/ui/src/components/step';
import { ControlWrapper } from '@erxes/ui/src/components/step/styles';
import { Indicator } from '@erxes/ui/src/components/step/styles';
import { StepWrapper } from '@erxes/ui/src/components/step/styles';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import React from 'react';
import { Link } from 'react-router-dom';
import { Content } from '@erxes/ui-settings/src/integrations/styles';
import { LeftContent } from '@erxes/ui-settings/src/integrations/styles';
import { PreviewWrapper } from '@erxes/ui/src/components/step/style';
import { __ } from '@erxes/ui/src/utils/core';
import ContentTypeStep from './step/ContenTypeStep';
import { Alert } from '@erxes/ui/src/utils';
import { IContentTypeDoc } from '../../types';

type Props = {
  action: (doc: any) => void;
  contentType?: IContentTypeDoc;
};

type State = {
  displayName: string;
  code: string;
  fields: any;
  siteId: string;
};

class ContentTypeForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { contentType = {} as IContentTypeDoc } = props;

    const fields = (contentType.fields || []).map(field => ({
      ...field,
      _id: Math.random()
    }));

    this.state = {
      displayName: contentType.displayName || '',
      code: contentType.code || '',
      fields: fields || [],
      siteId: contentType.siteId
    };
  }

  handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const { displayName, code, fields, siteId } = this.state;
    const { contentType } = this.props;

    if (!code) {
      return Alert.error('Please enter a code!');
    }

    const doc = {
      displayName,
      code,
      fields,
      siteId
    } as any;

    if (contentType) {
      doc._id = contentType._id;
    }

    this.props.action(doc);
  };

  onChange = (key: string, value: any) => {
    this.setState({ [key]: value } as any);
  };

  renderButtons = () => {
    const cancelButton = (
      <Link to="/webbuilder/contenttypes">
        <Button btnStyle="simple" icon="times-circle">
          Cancel
        </Button>
      </Link>
    );

    return (
      <Button.Group>
        {cancelButton}

        <Button
          btnStyle="success"
          icon={'check-circle'}
          onClick={this.handleSubmit}
        >
          Save
        </Button>
      </Button.Group>
    );
  };

  render() {
    const { displayName, code, siteId } = this.state;
    const { contentType } = this.props;

    const breadcrumb = [{ title: __('Content types'), link: '/contenttypes' }];

    return (
      <StepWrapper>
        <Wrapper.Header title={__('Content types')} breadcrumb={breadcrumb} />
        <Content>
          <LeftContent>
            <Steps>
              <Step
                img="/images/icons/erxes-04.svg"
                title="Content type"
                noButton={true}
              >
                <ContentTypeStep
                  onChange={this.onChange}
                  displayName={displayName}
                  code={code}
                  fields={this.state.fields}
                  siteId={siteId}
                />
              </Step>
            </Steps>

            <ControlWrapper>
              <Indicator>
                {__('You are')} {contentType ? 'editing' : 'creating'}{' '}
                <strong>{displayName}</strong> {__('content type')}
              </Indicator>
              {this.renderButtons()}
            </ControlWrapper>
          </LeftContent>

          <PreviewWrapper>
            <FullPreview
              onChange={this.onChange}
              color=""
              theme=""
              type="dropdown"
              fields={this.state.fields}
            />
          </PreviewWrapper>
        </Content>
      </StepWrapper>
    );
  }
}

export default ContentTypeForm;
