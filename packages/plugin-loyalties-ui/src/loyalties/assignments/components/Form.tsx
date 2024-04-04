import {
  Button,
  ControlLabel,
  Form,
  FormControl,
  FormGroup
} from '@erxes/ui/src/components';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { IAssignment, IAssignmentDoc } from '../types';
import {
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper
} from '@erxes/ui/src/styles/eindex';
import React from 'react';
import SelectCampaigns from '../../containers/SelectCampaigns';
import SelectCustomers from '@erxes/ui-contacts/src/customers/containers/SelectCustomers';
import { __, router } from '@erxes/ui/src/utils';
import { queries } from '../../../configs/assignmentCampaign/graphql';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  assignment: IAssignment;
  closeModal: () => void;
  queryParams: any;
  history: any;
};

type State = {
  assignment: IAssignment;
};

class AssignmentForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { assignment = {} as IAssignment, queryParams } = this.props;

    if (!assignment.campaignId && queryParams.campaignId) {
      assignment.campaignId = queryParams.campaignId;
    }

    if (!assignment.ownerType) {
      assignment.ownerType = 'customer';
    }

    this.state = {
      assignment
    };
  }

  generateDoc = (values: { _id: string } & IAssignmentDoc) => {
    const { assignment } = this.props;

    const finalValues = values;

    if (assignment) {
      finalValues._id = assignment._id;
    }

    return {
      ...this.state.assignment
    };
  };

  onChangeInput = e => {
    const name = e.target.name;
    let value = e.target.value;
    if (e.target.type === 'number') {
      value = Number(value);
    }

    this.setState({
      assignment: { ...this.state.assignment, [name]: value }
    } as any);
  };

  renderFormGroup = (label, props) => {
    return (
      <FormGroup>
        <ControlLabel>{label}</ControlLabel>
        <FormControl {...props} onChange={this.onChangeInput} />
      </FormGroup>
    );
  };

  onChangeCampaign = value => {
    const { assignment } = this.state;
    this.setState({ assignment: { ...assignment, campaignId: value } });
  };

  onChangeSelect = e => {
    const { assignment } = this.state;
    const target = e.currentTarget as HTMLInputElement;
    const value = target.value;
    const name = target.name;

    this.setState({ assignment: { ...assignment, [name]: value } });
  };

  onChangeOwnerId = ownerId => {
    const { assignment } = this.state;
    this.setState({ assignment: { ...assignment, ownerId } });
  };

  renderOwner = () => {
    const { assignment } = this.state;
    if (assignment.ownerType === 'customer') {
      return (
        <SelectCustomers
          label="Customer"
          name="ownerId"
          multi={false}
          initialValue={assignment.ownerId}
          onSelect={this.onChangeOwnerId}
        />
      );
    }
  };

  renderContent = (formProps: IFormProps) => {
    const { assignment } = this.state;
    const { closeModal, renderButton } = this.props;
    const { values, isSubmitted } = formProps;

    return (
      <>
        <ScrollWrapper>
          <FormGroup>
            <ControlLabel>Campaign</ControlLabel>
            <SelectCampaigns
              queryName="assignmentCampaigns"
              customQuery={queries.assignmentCampaigns}
              label="Choose assignment campaign"
              name="campaignId"
              onSelect={this.onChangeCampaign}
              initialValue={assignment.campaignId}
              filterParams={
                assignment._id
                  ? { equalTypeCampaignId: assignment.campaignId }
                  : {}
              }
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel required={true}>Owner</ControlLabel>
            {this.renderOwner()}
          </FormGroup>
        </ScrollWrapper>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            Close
          </Button>

          {renderButton({
            name: 'assignment',
            values: this.generateDoc(values),
            isSubmitted,
            object: this.props.assignment
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default AssignmentForm;
