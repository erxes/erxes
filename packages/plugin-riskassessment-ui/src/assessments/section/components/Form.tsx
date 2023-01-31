import { CollapseContent, FormGroup, ControlLabel, __ } from '@erxes/ui/src';
import React from 'react';
import { RiskCalculateLogicType } from '../../../indicator/common/types';
import { FormContainer } from '../../../styles';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import { SelectOperation } from '../../../common/utils';
import Chooser from './Chooser';

type Props = {
  riskAssessment: any;
  closeModal: () => void;
  handleSelect: (doc: any) => void;
};
type State = {
  page: number;
  perPage: number;
  branchIds: string[];
  departmentIds: string[];
  operationIds: string[];
  calculateLogics: RiskCalculateLogicType[];
  calculateMethod: string;
};

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    const { riskAssessment } = props;

    this.state = {
      perPage: 10,
      page: 1,
      branchIds: riskAssessment?.branchIds || [],
      departmentIds: riskAssessment?.departmentIds || [],
      operationIds: riskAssessment?.operationIds || [],
      calculateLogics: [],
      calculateMethod: ''
    };
  }

  renderFilter = () => {
    const { departmentIds, branchIds, operationIds } = this.state;
    const handleSelect = (name, value) => {
      this.setState({ [name]: value } as Pick<State, keyof State>);
    };
    return (
      <>
        <FormContainer row gap flex>
          <FormGroup>
            <ControlLabel>{__('Branches')}</ControlLabel>
            <SelectBranches
              name="branchIds"
              label="Select Branches"
              initialValue={branchIds}
              onSelect={value => handleSelect('branchIds', value)}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__('Department')}</ControlLabel>
            <SelectDepartments
              name="departmentIds"
              label="Select Departments"
              initialValue={departmentIds}
              onSelect={value => handleSelect('departmentIds', value)}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__('Operations')}</ControlLabel>
            <SelectOperation
              name="operationIds"
              label="Select Operations"
              initialValue={operationIds}
              multi={true}
              onSelect={value => handleSelect('operationIds', value)}
            />
          </FormGroup>
        </FormContainer>
      </>
    );
  };

  render() {
    const { riskAssessment, closeModal } = this.props;

    const { branchIds, departmentIds, operationIds } = this.state;

    const handleSelect = props => {
      this.props.handleSelect({
        ...props,
        branchIds,
        departmentIds,
        operationIds
      });
    };

    return (
      <FormContainer column gap>
        {this.renderFilter()}
        <Chooser
          detail={riskAssessment}
          closeModal={closeModal}
          refetchQueries={() => []}
          handleSelect={handleSelect}
          filters={{ branchIds, departmentIds, operationIds }}
        />
      </FormContainer>
    );
  }
}

export default Form;
