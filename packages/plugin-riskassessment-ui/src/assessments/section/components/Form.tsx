import { FormGroup, ControlLabel, __ } from '@erxes/ui/src';
import React from 'react';
import { RiskCalculateLogicType } from '../../../indicator/common/types';
import { FormContainer } from '../../../styles';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import { SelectOperations } from '../../../common/utils';
import Chooser from './Chooser';
import { RiskAssessmentTypes } from '../../common/types';

type Props = {
  riskAssessment: RiskAssessmentTypes;
  cardId: string;
  cardType: string;
  closeModal: () => void;
  handleSelect: (doc: any) => void;
};
type State = {
  page: number;
  perPage: number;
  branchId: string;
  departmentId: string;
  operationId: string;
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
      branchId: riskAssessment?.branchId || '',
      departmentId: riskAssessment?.departmentId || '',
      operationId: riskAssessment?.operationId || '',
      calculateLogics: [],
      calculateMethod: ''
    };
  }

  renderFilter = () => {
    const { departmentId, branchId, operationId } = this.state;
    const handleSelect = (name, value) => {
      this.setState({ [name]: value } as Pick<State, keyof State>);
    };
    return (
      <>
        <FormContainer row gap flex>
          <FormGroup>
            <ControlLabel>{__('Branches')}</ControlLabel>
            <SelectBranches
              name="branchId"
              label="Select Branches"
              initialValue={branchId}
              onSelect={value => handleSelect('branchId', value)}
              multi={false}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__('Department')}</ControlLabel>
            <SelectDepartments
              name="departmentId"
              label="Select Departments"
              initialValue={departmentId}
              onSelect={value => handleSelect('departmentId', value)}
              multi={false}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__('Operations')}</ControlLabel>
            <SelectOperations
              name="operationId"
              label="Select Operations"
              initialValue={operationId}
              multi={false}
              onSelect={value => handleSelect('operationId', value)}
            />
          </FormGroup>
        </FormContainer>
      </>
    );
  };

  render() {
    const { riskAssessment, cardId, cardType, closeModal } = this.props;

    const { branchId, departmentId, operationId } = this.state;

    const handleSelect = props => {
      this.props.handleSelect({
        ...props,
        branchId,
        departmentId,
        operationId
      });
    };

    const updatedProps = {
      cardId,
      cardType,
      detail: riskAssessment,
      closeModal,
      refetchQueries: () => [],
      handleSelect,
      filters: { branchId, departmentId, operationId }
    };

    return (
      <FormContainer column gap>
        {this.renderFilter()}
        <Chooser {...updatedProps} />
      </FormContainer>
    );
  }
}

export default Form;
