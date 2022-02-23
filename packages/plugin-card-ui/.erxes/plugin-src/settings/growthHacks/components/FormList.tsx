import React from 'react';
import Select from 'react-select-plus';
import styled from 'styled-components';

const Container = styled.div`
  width: 140px;
`;

type Props = {
  forms: any[];
  onChangeForm: (stageId: string, value: string) => void;
  stage: any;
};

class FormList extends React.Component<Props, {}> {
  generateForms = forms =>
    forms.map(form => ({
      value: form._id,
      label: form.title
    }));

  render() {
    const { forms, stage, onChangeForm } = this.props;

    const onChange = form => {
      let value = '';

      if (form) {
        value = form.value;
      }

      onChangeForm(stage._id, value);
    };

    return (
      <Container>
        <Select
          placeholder="Forms"
          onChange={onChange}
          value={stage.formId}
          options={this.generateForms(forms)}
        />
      </Container>
    );
  }
}

export default FormList;
