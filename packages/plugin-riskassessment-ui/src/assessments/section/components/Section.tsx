import {
  BarItems,
  Box,
  EmptyState,
  Icon,
  ModalTrigger,
  SectionBodyItem
} from '@erxes/ui/src';
import React from 'react';
import { ColorBox, FormContainer, ProductName } from '../../../styles';
import { RiskAssessmentTypes } from '../../common/types';
import AssignedUsers from '../containers/AssignedUsers';
import SinglAddForm from '../containers/SingkeAddForm';

type Props = {
  riskAssessments: RiskAssessmentTypes[];
  cardId: string;
  cardType: string;
};

class Section extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  renderChooserModal = (
    trigger: React.ReactNode,
    riskAssessment?: RiskAssessmentTypes
  ) => {
    const { cardId, cardType } = this.props;
    const content = ({ closeModal }) => {
      const updateProps = {
        riskAssessment,
        closeModal,
        cardId,
        cardType
      };

      return <SinglAddForm {...updateProps} />;
    };

    return (
      <ModalTrigger
        size="xl"
        trigger={trigger}
        content={content}
        title="Risk Assessment"
      />
    );
  };

  renderAssignedUser = () => {
    const { riskAssessments, cardId, cardType } = this.props;

    const updatedProps = {
      riskAssessments,
      cardId,
      cardType
    };

    return <AssignedUsers {...updatedProps} />;
  };

  renderItem = riskAssessment => {
    const {
      status,
      statusColor,
      department,
      branch,
      operation,
      group,
      indicator
    } = riskAssessment as RiskAssessmentTypes;

    const renderName = () => {
      if ([department, branch, operation].some(x => x)) {
        return `${branch?.title || ''} ${department?.title ||
          ''} ${operation?.name || ''}`;
      }

      if (group) {
        return group?.name || '';
      }
      if (indicator) {
        return indicator?.name || '';
      }

      if (status) {
        return status;
      }
      return '';
    };

    return (
      <ProductName>
        {renderName()}
        <ColorBox color={statusColor && statusColor} />
      </ProductName>
    );
  };

  renderSingleAssessment = (riskAssessment: RiskAssessmentTypes) => {
    if (!riskAssessment) {
      return <EmptyState text="No Risk Assessment" icon="list-2" />;
    }

    return (
      <SectionBodyItem>
        {this.renderChooserModal(
          this.renderItem(riskAssessment),
          riskAssessment
        )}
      </SectionBodyItem>
    );
  };

  renderBulkAssessment(riskAssessments: RiskAssessmentTypes[]) {
    return riskAssessments.map(assessment => (
      <SectionBodyItem key={assessment._id}>
        {this.renderSingleAssessment(assessment)}
      </SectionBodyItem>
    ));
  }

  renderAssessment() {
    const { riskAssessments } = this.props;

    if (!riskAssessments.length) {
      return <EmptyState text="No Risk Assessment" icon="list-2" />;
    }

    if (riskAssessments.length === 1) {
      return this.renderSingleAssessment(riskAssessments[0] || {});
    }

    if (riskAssessments.length > 1) {
      return this.renderBulkAssessment(riskAssessments);
    }

    return;
  }

  render() {
    const { riskAssessments } = this.props;

    const extraButton = (
      <BarItems>
        {this.renderChooserModal(
          <button>
            <Icon icon="plus-circle" />
          </button>
        )}
      </BarItems>
    );

    return (
      <FormContainer column padding="0 0 10px 0">
        <Box
          title="Risk Assessment"
          name="riskAssessments"
          extraButtons={!riskAssessments.length && extraButton}
          collapsible
        >
          {this.renderAssessment()}
        </Box>
        {!!riskAssessments.length && this.renderAssignedUser()}
      </FormContainer>
    );
  }
}

export default Section;
