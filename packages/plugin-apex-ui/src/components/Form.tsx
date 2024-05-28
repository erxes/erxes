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
import Select from 'react-select-plus';

type Props = {
  companies: any[];
  history: any;
  obj: any;
  save: (doc) => void;
};

type State = {
  type?: string;
  name?: string;
  code?: string;
  content?: string;
  companyId?: string;
  selectedType?: any;
  selectedCompany?: any;
};

const FormWrapper = styled.div`
  padding: 10px 20px;
`;
class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { obj } = props;

    this.state = {
      name: obj.name,
      type: obj.type,
      code: obj.code,
      content: obj.content,
      companyId: obj.companyId,
      selectedType: {
        value: obj.type,
        label:
          obj.type === 'finance'
            ? 'Санхүүгийн байдлийн тайлан'
            : 'Үйл ажиллагааний тайлан'
      },
      selectedCompany: {
        value: obj.companyId,
        label: obj.company ? obj.company.primaryName : ''
      }
    };
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
    const { type, name, code, content, companyId } = this.state;

    this.props.save({
      type,
      name,
      code,
      content,
      companyId
    });
  };

  onChangeCompany = obj => {
    this.setState({ selectedCompany: obj, companyId: obj.value });
  };

  onChangeType = obj => {
    this.setState({ selectedType: obj, type: obj.value });
  };

  render() {
    const { obj, companies } = this.props;
    const { selectedCompany, selectedType } = this.state;

    const formContent = (
      <FormWrapper>
        <FormGroup>
          <ControlLabel required={true}>Type</ControlLabel>

          <Select
            options={[
              { value: '', label: '' },
              { value: 'finance', label: 'Санхүүгийн байдлийн тайлан' },
              { value: 'operation', label: 'Үйл ажиллагааний тайлан' },
              { value: 'analysis', label: 'Анализ' }
            ]}
            value={selectedType}
            onChange={this.onChangeType}
          />
        </FormGroup>

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
          <ControlLabel required={true}>Company</ControlLabel>

          <Select
            options={companies.map(comp => ({
              value: comp._id,
              label: comp.primaryName
            }))}
            value={selectedCompany}
            onChange={this.onChangeCompany}
            searchable={true}
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
