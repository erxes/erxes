import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import EditorCK from '@erxes/ui/src/containers/EditorCK';
import { IFormProps } from '@erxes/ui/src/types';
import React from 'react';
import CommonForm from '@erxes/ui-settings/src/common/components/Form';
import { ICommonFormProps } from '@erxes/ui-settings/src/common/types';
import { IEmailTemplate } from '../types';
import TaggerPopover from '@erxes/ui-tags/src/components/TaggerPopover';
import { isEnabled } from '@erxes/ui/src/utils/core';
import { Icon, PopoverButton, Tags } from '@erxes/ui/src/index';
import { ColorButton } from '@erxes/ui-cards/src/boards/styles/common';

type Props = {
  object?: IEmailTemplate;
} & ICommonFormProps;

type State = {
  content: string;
};

class Form extends React.Component<Props & ICommonFormProps, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      content: (props.object && props.object.content) || ''
    };
  }

  onEditorChange = e => {
    this.setState({ content: e.editor.getData() });
  };

  generateDoc = (values: { _id?: string; name: string; content: string }) => {
    const { object } = this.props;
    const finalValues = values;

    if (object) {
      finalValues._id = object._id;
    }

    return {
      _id: finalValues._id,
      name: finalValues.name,
      content: this.state.content
    };
  };

  renderContent = (formProps: IFormProps) => {
    const object = this.props.object || ({} as IEmailTemplate);
    const tagTrigger = (
      <PopoverButton id="conversationTags">
        {object.tags?.length ? (
          <>
            <Tags tags={object.tags} limit={1} /> <Icon icon="angle-down" />
          </>
        ) : (
          <ColorButton>
            <Icon icon="tag-alt" /> No tags
          </ColorButton>
        )}
      </PopoverButton>
    );
    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>
          <FormControl
            {...formProps}
            name="name"
            defaultValue={object.name}
            type="text"
            required={true}
            autoFocus={true}
          />
        </FormGroup>

        {isEnabled('tags') && (
          <TaggerPopover
            type={'emailtemplates:emailtemplates'}
            trigger={tagTrigger}
            refetchQueries={['dealDetail']}
            targets={[object]}
            singleSelect={true}
          />
        )}

        <FormGroup>
          <ControlLabel>Content</ControlLabel>
          <EditorCK
            content={this.state.content}
            onChange={this.onEditorChange}
            autoGrow={true}
            isSubmitted={formProps.isSaved}
            name={`emailTemplates_${object._id || 'create'}`}
          />
        </FormGroup>
      </>
    );
  };

  render() {
    const { object } = this.props;

    return (
      <CommonForm
        {...this.props}
        name="email template"
        renderContent={this.renderContent}
        generateDoc={this.generateDoc}
        object={object}
        createdAt={
          object && object.modifiedAt !== object.createdAt && object.createdAt
        }
      />
    );
  }
}

export default Form;
