import styled from 'styled-components';
import Button from '@erxes/ui/src/components/Button';
import React from 'react';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import EditorCK from '../containers/EditorCK';
import { __ } from 'coreui/utils';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { Title } from '@erxes/ui/src/styles/main';
import TaggerPopover from '@erxes/ui-tags/src/components/TaggerPopover';
import { isEnabled } from '@erxes/ui/src/utils/core';
import { ColorButton } from '@erxes/ui-cards/src/boards/styles/common';
import { Icon, PopoverButton, Tags } from '@erxes/ui/src/index';

type Props = {
  contentType: String;
  history: any;
  obj: any;
  save: (doc) => void;
};

type State = {
  name?: string;
  content?: string;
  replacer?: string;
};

const FormWrapper = styled.div`
  padding: 10px 20px;
`;
class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { obj } = props;

    this.state = { name: obj.name, content: obj.content };
  }

  onContentChange = e => {
    this.setState({ content: e.editor.getData() });
  };

  onChangeField = (key, e) => {
    this.setState({ [key]: e.currentTarget.value });
  };

  onCancel = () => {
    const { history } = this.props;

    history.push('/settings/documents');
  };

  onSave = () => {
    const { name, content, replacer } = this.state;

    this.props.save({
      name,
      content,
      replacer
    });
  };

  render() {
    const { obj, contentType } = this.props;

    const tagTrigger = (
      <PopoverButton id="conversationTags">
        {obj.tags?.length ? (
          <>
            <Tags tags={obj.tags} limit={1} /> <Icon icon="angle-down" />
          </>
        ) : (
          <ColorButton>
            <Icon icon="tag-alt" /> No tags
          </ColorButton>
        )}
      </PopoverButton>
    );

    const { content } = this.state;

    const formContent = (
      <FormWrapper>
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>

          <FormControl
            name="name"
            required={true}
            autoFocus={true}
            defaultValue={obj.name}
            onChange={this.onChangeField.bind(this, 'name')}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Tags</ControlLabel>

          {isEnabled('tags') && (
            <TaggerPopover
              type={'documents:documents'}
              trigger={tagTrigger}
              refetchQueries={['documentsDetail']}
              targets={[obj]}
              singleSelect={true}
            />
          )}
        </FormGroup>

        <FormGroup>
          <div style={{ float: 'left', width: '800px', marginRight: '50px' }}>
            <EditorCK
              contentType={obj.contentType || contentType}
              content={obj.content}
              onChange={this.onContentChange}
              height={600}
              name="document-form"
            />
          </div>

          <div
            style={{ float: 'left' }}
            dangerouslySetInnerHTML={{ __html: content || '' }}
          ></div>

          <div style={{ clear: 'both' }} />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Replacer</ControlLabel>

          <FormControl
            componentClass="textarea"
            name="name"
            required={true}
            defaultValue={obj.replacer}
            onChange={this.onChangeField.bind(this, 'replacer')}
          />
        </FormGroup>
      </FormWrapper>
    );

    const actionButtons = (
      <>
        <Button btnStyle="simple" type="button" onClick={this.onCancel}>
          {__('Cancel')}
        </Button>

        <Button onClick={this.onSave} btnStyle="success" type="button">
          {__('Save')}
        </Button>
      </>
    );

    const breadcrumb = [
      { title: __('Settings'), link: '/settings' },
      { title: __('Documents'), link: '/documents' }
    ];

    return (
      <Wrapper
        header={
          <Wrapper.Header title={__('Documents')} breadcrumb={breadcrumb} />
        }
        actionBar={
          <Wrapper.ActionBar
            left={<Title>{__('Document form')}</Title>}
            right={actionButtons}
          />
        }
        content={formContent}
        transparent={true}
        hasBorder
      />
    );
  }
}

export default Form;
