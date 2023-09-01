import { gql } from '@apollo/client';
import {
  Alert,
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  SelectTeamMembers,
  Toggle,
  __
} from '@erxes/ui/src';
import client from '@erxes/ui/src/apolloClient';
import { Columns } from '@erxes/ui/src/styles/chooser';
import { Column, ModalFooter } from '@erxes/ui/src/styles/main';
import React from 'react';
import { SelectIndicatorGroups, SelectIndicators } from '../../common/utils';
import { FormContainer } from '../../styles';
import { IPLan, ISchedule } from '../common/types';
import { CardCustomFields, SelectStructure } from '../common/utils';
import { mutations } from '../graphql';

type Props = {
  history: any;
  schedule?: ISchedule;
  plan: IPLan;
  refetch: () => void;
  cardType: string;
  pipelineId: string;
  closeModal: () => void;
  duplicate?: boolean;
};

type State = {
  doc: any;
  useGroup: boolean;
  isDisabled: boolean;
};
class ScheduleForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      doc: props?.schedule || {},
      useGroup: props?.doc?.groupId || false,
      isDisabled: props?.plan?.status === 'archived'
    };
  }

  render() {
    const {
      schedule,
      closeModal,
      refetch,
      cardType,
      pipelineId,
      plan,
      duplicate
    } = this.props;
    const { useGroup, doc, isDisabled } = this.state;
    const { structureType, structureDetail } = plan;

    const handleChange = (value, name) => {
      this.setState({ doc: { ...doc, [name]: value } });
    };

    const onChange = e => {
      const { value, name } = e.currentTarget as HTMLInputElement;

      handleChange(value, name);
    };

    const handleSave = () => {
      let mutation = mutations.addSchedule;
      const isUpdate = typeof schedule?._id === 'string' && !duplicate;

      if (isUpdate) {
        mutation = mutations.updateSchedule;
      }

      client
        .mutate({
          mutation: gql(mutation),
          variables: { planId: plan._id, ...doc }
        })
        .then(() => {
          refetch && refetch();
          Alert.success(
            `${isUpdate ? 'Updated' : 'Added'} schedule successfully`
          );
          closeModal();
        })
        .catch(err => {
          Alert.error(err.message);
        });
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
              filterParams={{
                tagIds: plan?.tagId ? [plan?.tagId] : undefined,
                withChilds: true
              }}
            />
          ) : (
            <SelectIndicators
              initialValue={doc?.indicatorId}
              label="Select Indicator"
              name="indicatorId"
              onSelect={handleChange}
              filterParams={{
                tagIds: plan?.tagId ? [plan?.tagId] : undefined,
                withChilds: true
              }}
            />
          )}
        </FormGroup>
        <Columns style={{ gap: '20px' }}>
          <Column>
            <SelectStructure
              name="structureTypeId"
              structureType={structureType}
              structureTypeId={schedule?.structureTypeId}
              onChange={handleChange}
              filter={{ searchValue: structureDetail?.code || '' }}
            />
          </Column>
          <Column>
            <FormGroup>
              <ControlLabel>{__('Assign To')}</ControlLabel>
              <SelectTeamMembers
                initialValue={doc.assignedUserIds}
                label="Assign To"
                name="assignedUserIds"
                onSelect={handleChange}
              />
            </FormGroup>
          </Column>
        </Columns>
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
        <CardCustomFields
          type={cardType}
          pipelineId={pipelineId}
          onChangeField={(name, value) => handleChange(value, name)}
          object={doc}
          customFieldsData={doc.customFieldsData || []}
        />

        {!isDisabled && (
          <ModalFooter>
            <Button btnStyle="simple" onClick={closeModal}>
              {__('Close')}
            </Button>
            <Button btnStyle="success" onClick={handleSave}>
              {__('Save')}
            </Button>
          </ModalFooter>
        )}
      </>
    );
  }
}

export default ScheduleForm;
