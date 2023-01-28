import React from 'react';
import { IConformityDetail } from '../common/types';
import { FormContainer } from '../../styles';
import {
  FormGroup,
  ControlLabel,
  __,
  FormControl,
  CollapseContent
} from '@erxes/ui/src';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import { CommonCalculateFields, SelectOperation } from '../../common/utils';
import Chooser from './Chooser';
import { RiskCalculateLogicType } from '../../indicator/common/types';

type Props = {
  detail: IConformityDetail;
  refetchQueries: ({ id }: { id: string }) => any;
  closeModal: () => void;
  handleSelect: (doc: any, detail?: any) => void;
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

    const { detail } = props;

    this.state = {
      perPage: 10,
      page: 1,
      branchIds: detail?.branchIds || [],
      departmentIds: detail?.departmentIds || [],
      operationIds: detail?.operationIds || [],
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
    const { closeModal, refetchQueries, detail } = this.props;
    const { branchIds, departmentIds, operationIds } = this.state;
    const handleSelect = ({
      indicatorIds,
      groupId
    }: {
      indicatorIds?: string[];
      groupId?: string[];
    }) => {
      this.props.handleSelect(
        { indicatorIds, groupId, branchIds, departmentIds, operationIds },
        detail
      );
    };

    return (
      <FormContainer column gap>
        <CollapseContent title="Configration">
          {this.renderFilter()}
        </CollapseContent>
        <Chooser
          detail={detail}
          closeModal={closeModal}
          refetchQueries={refetchQueries}
          handleSelect={handleSelect}
          filters={{ branchIds, departmentIds, operationIds }}
        />
      </FormContainer>
    );
  }
}

export default Form;
