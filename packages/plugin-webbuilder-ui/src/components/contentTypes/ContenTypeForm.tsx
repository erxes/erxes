import { LeftItem, RightItem, TypeFormContainer } from './styles';

import { Alert } from '@erxes/ui/src/utils';
import Button from '@erxes/ui/src/components/Button';
import ContentTypeStep from './step/ContenTypeStep';
import FullPreview from './step/FullPreview';
import { IContentTypeDoc } from '../../types';
import { Link } from 'react-router-dom';
import React from 'react';
import { SubTitle } from '../sites/styles';
import { __ } from '@erxes/ui/src/utils/core';

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
        <Button btnStyle="simple" size="small" icon="times-circle">
          Cancel
        </Button>
      </Link>
    );

    const deleteButton = (
      <Button
        btnStyle="danger"
        icon="trash-alt"
        size="small"
        // onClick={() => remove(page._id, onCancel(null, ""))}
      >
        Delete
      </Button>
    );

    return (
      <Button.Group>
        {deleteButton}
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
    const { displayName, code, siteId } = this.state;
    const { contentType } = this.props;

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
            fields={this.state.fields}
            siteId={siteId}
          />
        </LeftItem>

        <RightItem>
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
