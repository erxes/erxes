import { gql, useQuery } from '@apollo/client';
import GenerateAddFormFields from '@erxes/ui-cards/src/boards/components/portable/GenerateAddFormFields';
import { queries as formQueries } from '@erxes/ui-forms/src/forms/graphql';
import {
  Button,
  ControlLabel,
  DateControl,
  FormControl,
  FormGroup,
  SelectTeamMembers,
  Spinner,
  Toggle,
  __
} from '@erxes/ui/src';
import { DateContainer, ModalFooter } from '@erxes/ui/src/styles/main';
import React from 'react';
import { SelectIndicatorGroups, SelectIndicators } from '../../common/utils';
import { FormContainer } from '../../styles';

type Props = {
  plan: any;
  cardType: string;
  pipelineId: string;
  closeModal: () => void;
  onSave: (doc: any) => void;
};

type State = {
  doc: any;
  useGroup: boolean;
};

function AddCardForm({ type, pipelineId, onChange, customFieldsData, object }) {
  const { data, loading } = useQuery(gql(formQueries.fields), {
    variables: {
      contentType: `cards:${type}`,
      isVisibleToCreate: true,
      pipelineId
    }
  });

  if (loading) {
    return <Spinner />;
  }
  return (
    <GenerateAddFormFields
      object={object}
      pipelineId={pipelineId}
      onChangeField={(name, value) => onChange(value, name)}
      fields={data?.fields}
      customFieldsData={customFieldsData}
    />
  );
}

class PlanForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      doc: props?.plan || {},
      useGroup: props?.doc?.groupId || false
    };
  }

  render() {
    const { onSave, closeModal, cardType, pipelineId } = this.props;
    const { useGroup, doc } = this.state;

    const handleChange = (value, name) => {
      this.setState({ doc: { ...doc, [name]: value } });
    };

    const onChange = e => {
      const { value, name } = e.currentTarget as HTMLInputElement;

      handleChange(value, name);
    };

    const handleSave = () => {
      onSave(doc);
      closeModal();
    };

    return (
      <>
        <FormGroup>
          <FormContainer spaceBetween>
            <ControlLabel>
              {__(`Select ${useGroup ? 'Group' : 'Indicator'}`)}
            </ControlLabel>
            <Toggle
              checked={useGroup}
              onChange={() => this.setState({ useGroup: !useGroup })}
            />
          </FormContainer>
          {useGroup ? (
            <SelectIndicatorGroups
              initialValue={doc?.groupId}
              label="Select Group"
              name="groupId"
              onSelect={handleChange}
            />
          ) : (
            <SelectIndicators
              initialValue={doc?.indicatorId}
              label="Select Indicator"
              name="indicatorId"
              onSelect={handleChange}
            />
          )}
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Assign To')}</ControlLabel>
          <SelectTeamMembers
            label="Assign To"
            name="assignUserIds"
            onSelect={handleChange}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Date')}</ControlLabel>
          <DateContainer>
            <DateControl
              name="date"
              value={doc.date}
              placeholder="select from date "
              onChange={e => handleChange(e, 'date')}
            />
          </DateContainer>
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Name')}</ControlLabel>
          <FormControl
            name="name"
            required
            defaultValue={doc.name}
            placeholder="Type a name"
            onChange={onChange}
          />
        </FormGroup>
        <AddCardForm
          type={cardType}
          pipelineId={pipelineId}
          onChange={handleChange}
          object={doc}
          customFieldsData={doc.customFieldsData || []}
        />

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal}>
            {__('Close')}
          </Button>
          <Button btnStyle="success" onClick={handleSave}>
            {__('Save')}
          </Button>
        </ModalFooter>
      </>
    );
  }
}

export default PlanForm;
