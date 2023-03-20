import { ControlLabel, FormGroup, Toggle, __ } from '@erxes/ui/src';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import React from 'react';
import { SelectOperations } from '../../../common/utils';
import { FormContainer } from '../../../styles';
import { RiskAssessmentTypes } from '../../common/types';
import BulkAddForm from '../containers/BulkAddForm';
import Chooser from './Chooser';

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
  useBulkCreate: boolean;
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
      useBulkCreate: false
    };
  }

  renderFilter = () => {
    const { departmentId, branchId, operationId } = this.state;
    const handleSelect = (value, name) => {
      this.setState({ [name]: value } as Pick<State, keyof State>);
    };

    return (
      <>
        <FormContainer row gap flex>
          <FormGroup>
            <ControlLabel>{__('Branch')}</ControlLabel>
            <SelectBranches
              name={'branchId'}
              label={`Select Branch`}
              initialValue={branchId}
              onSelect={handleSelect}
              multi={false}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__('Department')}</ControlLabel>
            <SelectDepartments
              name={'departmentId'}
              label={`Select Department`}
              initialValue={departmentId}
              onSelect={handleSelect}
              multi={false}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>{__('Operation')}</ControlLabel>
            <SelectOperations
              name={'operationId'}
              label={`Select Operation`}
              initialValue={operationId}
              multi={false}
              onSelect={handleSelect}
            />
          </FormGroup>
        </FormContainer>
      </>
    );
  };

  renderSingleAssessment() {
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
      <>
        {this.renderFilter()}
        <Chooser {...updatedProps} />
      </>
    );
  }

  renderBulkAssessment() {
    const { cardId, cardType, closeModal } = this.props;

    const updatedProps = {
      closeModal,
      cardId,
      cardType
    };
    return <BulkAddForm {...updatedProps} />;
  }

  render() {
    const { useBulkCreate } = this.state;

    const toggleOneByOne = () => {
      if (!useBulkCreate) {
        this.setState({
          branchId: '',
          departmentId: '',
          operationId: ''
        });
      }

      this.setState({ useBulkCreate: !useBulkCreate });
    };

    return (
      <FormContainer column gap>
        <FormContainer row gap align="center">
          <Toggle onChange={toggleOneByOne} checked={useBulkCreate} />
          <ControlLabel>
            {__('generate one-by-one assessment with selected structures')}
          </ControlLabel>
        </FormContainer>
        {useBulkCreate
          ? this.renderBulkAssessment()
          : this.renderSingleAssessment()}
      </FormContainer>
    );
  }
}

export default Form;
