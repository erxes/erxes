import Button from '@erxes/ui/src/components/Button';
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

type Props = {
  action: (doc: any) => void;
  contentType?: any;
};

type State = {
  displayName: string;
  code: string;
  fields: any;
};

class CreateContentType extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { contentType = {} } = props;

    this.state = {
      displayName: contentType.displayName || '',
      code: contentType.code || '',
      fields: contentType.fields || []
    };
  }

  handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const { displayName, code, fields } = this.state;
    const { contentType } = this.props;

    const doc = {
      displayName,
      code,
      fields
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
    const { displayName, code } = this.state;
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
            {/* <FullPreview
              onChange={this.onChange}
              onDocChange={this.onFormDocChange}
              calloutTitle={calloutTitle}
              calloutBtnText={calloutBtnText}
              bodyValue={bodyValue}
              type={type}
              color={color}
              theme={theme}
              image={logo}
              thankTitle={thankTitle}
              thankContent={thankContent}
              skip={isSkip}
              carousel={carousel}
              formData={formData}
              calloutImgSize={calloutImgSize}
              successImgSize={successImageSize}
              successImage={successImage}
              configs={configs} */}
            {/* /> */}
          </PreviewWrapper>
        </Content>
      </StepWrapper>
    );
  }
}

export default CreateContentType;
