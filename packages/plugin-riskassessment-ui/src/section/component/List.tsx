import { SectionBodyItem, __ } from '@erxes/ui/src';
import {
  Box,
  Button,
  EmptyState,
  Icon,
  ModalTrigger,
  NameCard,
  Tip
} from '@erxes/ui/src/components';
import React from 'react';
import { IConformityDetail } from '../common/types';
import { RiskIndicatorsType } from '../../indicator/common/types';
import { ColorBox, ProductName } from '../../styles';
import RiskAssessmentChooser from '../container/Form';
import SubmitForm from '../container/SubmitForm';
type Props = {
  conformity: IConformityDetail;
  refetch: () => void;
  refetchSubmissions: () => void;
  submissions: any[];
  cardId: string;
  cardType: string;
  currentUser: any;
};

function RiskAssessmentSection(props: Props) {
  const { conformity, submissions, currentUser } = props;

  const renderChooserModal = (trigger: React.ReactNode) => {
    const { cardId } = props;
    const content = ({ closeModal }) => {
      const updateProps = {
        ...props,
        closeModal,
        cardId,
        id: cardId
      };

      return <RiskAssessmentChooser {...updateProps} />;
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

  const renderItem = (title, statusColor) => {
    return (
      <ProductName>
        {title && title}
        <ColorBox color={statusColor && statusColor} />
      </ProductName>
    );
  };

  const renderSubmissionForm = ({
    isSubmitted,
    email,
    riskIndicatorId
  }: {
    isSubmitted?: boolean;
    email: string;
    riskIndicatorId?: string;
  }) => {
    if (currentUser.email !== email) {
      if (isSubmitted) {
        return (
          <Button btnStyle="link">
            <Tip text="Submitted" placement="bottom">
              <Icon color="green" icon="check-1" />
            </Tip>
          </Button>
        );
      }
    }

    const trigger = (
      <Button btnStyle="link">
        <Tip text={isSubmitted ? 'See Submitted Form' : 'Submission Form'}>
          <Icon
            color={isSubmitted ? 'purple' : 'green'}
            icon={isSubmitted ? 'file-check' : 'file-edit-alt'}
          />
        </Tip>
      </Button>
    );

    const content = ({ closeModal }) => {
      const updateProps = {
        cardId: props.cardId,
        cardType: props.cardType,
        currentUserId: props.currentUser._id,
        closeModal: closeModal,
        refetch: props.refetch,
        riskIndicatorId: riskIndicatorId,
        refetchSubmissions: props.refetchSubmissions,
        riskAssessmentId: conformity.riskAssessmentId,
        isSubmitted: isSubmitted
      };

      return <SubmitForm {...updateProps} />;
    };

    return (
      <ModalTrigger
        title="Your Risk Assessment Submission Form"
        trigger={trigger}
        content={content}
        backDrop
        size="lg"
        isAnimate
      />
    );
  };

  const renderRiskAssessmentList = () => {
    if (!conformity?.riskAssessment) {
      return <EmptyState icon="folder-2" text={`No risk assessment`} />;
    }
    const { riskAssessment, cardId } = conformity;

    return (
      <div>
        {
          <SectionBodyItem key={conformity?._id}>
            {renderChooserModal(
              renderItem(riskAssessment?.status, riskAssessment?.statusColor)
            )}
          </SectionBodyItem>
        }
      </div>
    );
  };

  const renderAssignedUserList = () => {
    if (!conformity || !submissions.length) {
      return (
        <EmptyState
          icon="folder-2"
          text={`No risk assessment assigned users`}
        />
      );
    }

    return submissions.map(user => (
      <SectionBodyItem key={user._id}>
        <ProductName>
          <NameCard user={user} />
          {renderSubmissionForm({
            isSubmitted: user.isSubmittedRiskAssessmentForm,
            email: user.email,
            riskIndicatorId: ''
          })}
        </ProductName>
      </SectionBodyItem>
    ));
  };

  return (
    <>
      <Box
        name="riskIndicator"
        title={__('Risk Assessment')}
        extraButtons={renderChooserModal(
          <button>
            <Icon icon="plus-circle" />
          </button>
        )}
      >
        {renderRiskAssessmentList()}
      </Box>
      <Box name="riskSubmissions" title={__('Risk Assessment Assigned Users')}>
        {renderAssignedUserList()}
      </Box>
    </>
  );
}

export default RiskAssessmentSection;
