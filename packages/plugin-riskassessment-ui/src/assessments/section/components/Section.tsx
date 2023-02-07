import {
  Box,
  EmptyState,
  Icon,
  ModalTrigger,
  SectionBodyItem
} from '@erxes/ui/src';
import React from 'react';
import { ColorBox, FormContainer, ProductName } from '../../../styles';
import AssignedUsers from '../containers/AssignedUsers';
import Form from '../containers/Form';

type Props = {
  riskAssessment: any;
  cardId: string;
  cardType: string;
};

class Section extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  renderChooserModal = (trigger: React.ReactNode) => {
    const { cardId, cardType, riskAssessment } = this.props;
    const content = ({ closeModal }) => {
      const updateProps = {
        riskAssessment,
        closeModal,
        cardId,
        cardType
      };

      return <Form {...updateProps} />;
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
    const { riskAssessment, cardId, cardType } = this.props;
    const updatedProps = {
      riskAssessmentId: riskAssessment._id,
      cardId,
      cardType
    };

    return <AssignedUsers {...updatedProps} />;
  };

  renderItem = (title, statusColor) => {
    return (
      <ProductName>
        {title && title}
        <ColorBox color={statusColor && statusColor} />
      </ProductName>
    );
  };

  renderContent = () => {
    const { riskAssessment } = this.props;

    if (!riskAssessment) {
      return <EmptyState text="No Risk Assessment" icon="list-2" />;
    }

    return (
      <SectionBodyItem>
        {this.renderChooserModal(
          this.renderItem(riskAssessment?.status, riskAssessment?.statusColor)
        )}
      </SectionBodyItem>
    );
  };

  render() {
    const { riskAssessment } = this.props;

    const extraButton = this.renderChooserModal(
      <button>
        <Icon icon="plus-circle" />
      </button>
    );

    return (
      <FormContainer column padding="0 0 10px 0">
        <Box
          title="Risk Assessment"
          extraButtons={!riskAssessment && extraButton}
        >
          {this.renderContent()}
        </Box>
        {riskAssessment && this.renderAssignedUser()}
      </FormContainer>
    );
  }
}

export default Section;
