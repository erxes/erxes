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

type Props = {
  history: any;
  obj: any;
  save: (doc) => void;
};

type State = {
  name?: string;
  code?: string;
  content?: string;
};

const FormWrapper = styled.div`
  padding: 10px 20px;
`;
class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { obj } = props;

    this.state = { name: obj.name, code: obj.code, content: obj.content };
  }

  onContentChange = e => {
    this.setState({ content: e.editor.getData() });
  };

  onChangeField = (key, e) => {
    this.setState({ [key]: e.currentTarget.value });
  };

  onCancel = () => {
    const { history } = this.props;

    history.push('/settings/apexreports');
  };

  onSave = () => {
    const { name, code, content } = this.state;

    this.props.save({
      name,
      code,
      content
    });
  };

  render() {
    const { obj } = this.props;
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
          <ControlLabel required={true}>Code</ControlLabel>

          <FormControl
            name="code"
            required={true}
            autoFocus={true}
            defaultValue={obj.code}
            onChange={this.onChangeField.bind(this, 'code')}
          />
        </FormGroup>

        <FormGroup>
          <EditorCK
            content={obj.content}
            onChange={this.onContentChange}
            height={600}
            name="report-form"
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
      { title: __('Reports'), link: '/reports' }
    ];

    return (
      <Wrapper
        header={
          <Wrapper.Header title={__('Reports')} breadcrumb={breadcrumb} />
        }
        actionBar={
          <Wrapper.ActionBar
            left={<Title>{__('Report form')}</Title>}
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
