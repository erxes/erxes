import { EmptyState } from '@erxes/ui/src';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import __ from 'lodash';
import React from 'react';
import { SelectOperations } from '../../../common/utils';
import { FormContainer } from '../../../styles';
import { RiskAssessmentTypes } from '../../common/types';
import RiskAssessmentForm from '../containers/RiskAssessmentForm';

type Props = {
  riskAssessments: RiskAssessmentTypes[];
  filters: {
    cardId: string;
    cardType: string;
    userId: string;
  };
  closeModal: () => void;
  onlyPreview?: boolean;
};

type State = {
  selected: any;
};

class MultipleAssessment extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      selected: {}
    };
  }

  componentDidMount() {
    if (!!this.props?.riskAssessments?.length) {
      const { riskAssessments } = this.props;

      let riskAssessment: any = {};
      if (
        riskAssessments.every(
          riskAssessment => riskAssessment.status !== 'In Progress'
        )
      ) {
        riskAssessment = riskAssessments[0];
      } else {
        riskAssessment = riskAssessments.find(
          riskAssessment => riskAssessment.status === 'In Progress'
        );
      }

      const selected = Object.fromEntries(
        Object.entries({
          branchId: riskAssessment?.branchId,
          departmentId: riskAssessment?.departmentId,
          operationId: riskAssessment?.operationId,
          indicatorId: riskAssessment?.indicatorId
        }).filter(([_, property]) => property)
      );

      this.setState({ selected });
    }
  }

  renderSelection(list: RiskAssessmentTypes[], Component: any, type: string) {
    const { selected } = this.state;
    const fieldName = type.toLowerCase() + 'Id';

    const ids = list.map(item => item[fieldName]).filter(item => item);
    if (!ids?.length) {
      return;
    }

    const handleSelect = (values, name) => {
      this.setState({ selected: { [name]: values } });
    };

    return (
      <Component
        key={Math.random()}
        name={fieldName}
        label={`Choose ${type}`}
        initialValue={selected[fieldName] || ''}
        onSelect={handleSelect}
        filterParams={{ ids }}
        multi={false}
      />
    );
  }

  renderAssessment() {
    const { riskAssessments, onlyPreview, closeModal, filters } = this.props;
    const { selected } = this.state;

    if (__.isEmpty(selected)) {
      return <EmptyState text="Something went wrong" />;
    }

    const [key, value] = Object.entries(selected)[0];

    const riskAssessment =
      riskAssessments.find(riskAssessment => riskAssessment[key] === value) ||
      ({} as RiskAssessmentTypes);
    if (!riskAssessment) {
      return <EmptyState text="Something went wrong" />;
    }

    const handleClose = () => {
      const riskAssessment = riskAssessments.find(
        riskAssessment => riskAssessment.status === 'In Progress'
      );
      if (!riskAssessment) {
        closeModal();
      }

      this.setState({
        selected: Object.fromEntries(
          Object.entries({
            branchId: riskAssessment?.branchId,
            departmentId: riskAssessment?.departmentId,
            operationId: riskAssessment?.operationId,
            indicatorId: riskAssessment?.indicatorId
          }).filter(([_, property]) => property)
        )
      });
    };

    const { _id, branchId, departmentId, operationId } = riskAssessment;
    const updateProps = {
      filters: {
        ...filters,
        riskAssessmentId: _id,
        branchId,
        departmentId,
        operationId
      },
      onlyPreview,
      closeModal: handleClose
    };

    return <RiskAssessmentForm {...updateProps} />;
  }

  render() {
    const { riskAssessments } = this.props;

    const selections = [
      {
        type: 'Branch',
        component: SelectBranches
      },
      {
        type: 'Department',
        component: SelectDepartments
      },
      {
        type: 'Operation',
        component: SelectOperations
      }
    ];

    return (
      <>
        <FormContainer row maxItemsRow={4} flexWrap gap>
          {selections.map(selection =>
            this.renderSelection(
              riskAssessments,
              selection.component,
              selection.type
            )
          )}
        </FormContainer>
        {this.renderAssessment()}
      </>
    );
  }
}

export default MultipleAssessment;
