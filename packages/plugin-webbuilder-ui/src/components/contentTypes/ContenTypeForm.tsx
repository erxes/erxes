import { LeftItem, SubTitle } from '../sites/styles';
import { RightItem, TypeFormContainer } from './styles';

import { Alert } from '@erxes/ui/src/utils';
import Button from '@erxes/ui/src/components/Button';
import ContentTypeStep from './step/ContenTypeStep';
import FullPreview from './step/FullPreview';
import { IContentType } from '../../types';
import Icon from '@erxes/ui/src/components/Icon';
import React from 'react';
import { __ } from '@erxes/ui/src/utils/core';

type Props = {
  action: (doc: any, afterSave?: any) => void;
  remove: (contentTypeId: string, afterSave?: any) => void;
  onCancel: (settingsObject: any, type: string) => void;
  siteId: string;
  contentType: IContentType;
};

type State = {
  displayName: string;
  code: string;
  fields: any;
};

class ContentTypeForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const { contentType } = props;

    const fields = (contentType.fields || []).map(field => ({
      ...field,
      _id: Math.random()
    }));

    this.state = {
      displayName: contentType.displayName || '',
      code: contentType.code || '',
      fields: fields || []
    };
  }

  componentDidUpdate(prevProps) {
    const { contentType } = this.props;

    const fields = (contentType.fields || []).map(field => ({
      ...field,
      _id: Math.random()
    }));

    if (prevProps.contentType !== contentType) {
      this.setState({
        displayName: contentType.displayName,
        code: contentType.code,
        fields: fields || []
      });
    }
  }

  handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const { displayName, code, fields } = this.state;
    const { contentType, onCancel, siteId } = this.props;

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

    this.props.action(doc, () => onCancel(null, ''));
  };

  onChange = (key: string, value: any) => {
    this.setState({ [key]: value } as any);
  };

  renderButtons = () => {
    const { onCancel, remove, contentType } = this.props;

    const cancelButton = (
      <Button
        btnStyle="simple"
        size="small"
        icon="times-circle"
        onClick={() => onCancel(null, '')}
      >
        Cancel
      </Button>
    );

    return (
      <Button.Group>
        {contentType.displayName && (
          <Button
            btnStyle="danger"
            icon="trash-alt"
            size="small"
            onClick={() => remove(contentType._id, onCancel(null, ''))}
          >
            Delete
          </Button>
        )}
        {cancelButton}

        <Button
          btnStyle="success"
          icon={'check-circle'}
          size="small"
          onClick={this.handleSubmit}
        >
          Save
        </Button>
      </Button.Group>
    );
  };

  render() {
    const { displayName, code, fields } = this.state;

    return (
      <TypeFormContainer className="gjs-one-bg gjs-two-color">
        <LeftItem>
          <SubTitle flexBetween={true}>
            {__('Content Type Settings')}
            {this.renderButtons()}
          </SubTitle>
          <ContentTypeStep
            onChange={this.onChange}
            displayName={displayName}
            code={code}
            fields={fields}
          />
        </LeftItem>

        <RightItem>
          <SubTitle>
            <div>
              <Icon icon="file-search-alt" size={18} />
              &nbsp;
              {__('Editor Preview')}
            </div>
          </SubTitle>
          <FullPreview
            onChange={this.onChange}
            color=""
            theme=""
            type="dropdown"
            fields={this.state.fields}
          />
        </RightItem>
      </TypeFormContainer>
    );
  }
}

export default ContentTypeForm;
