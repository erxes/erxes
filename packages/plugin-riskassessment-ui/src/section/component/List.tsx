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
import { ICardRiskAssements, RiskAssessmentsType } from '../../common/types';
import { ColorBox, ProductName } from '../../styles';
import RiskAssessmentChooser from '../container/Form';
import Submissions from '../container/Submissions';
type Props = {
  conformity: ICardRiskAssements;
  refetch: () => void;
  refetchSubmissions: () => void;
  submissions: any[];
  cardId: string;
  cardType: string;
  currentUser: any;
};

function RiskAssessmentSection(props: Props) {
  const { conformity, submissions, currentUser } = props;

  const renderChooserModal = (
    trigger: React.ReactNode,
    riskAssessmentId?: string
  ) => {
    const content = ({ closeModal }) => {
      const updateProps = {
        ...props,
        closeModal,
        riskAssessmentId
      };

      return <RiskAssessmentChooser {...updateProps} />;
    };

    return (
      <ModalTrigger
        size="lg"
        trigger={trigger}
        content={content}
        title="Risk Assessment"
      />
    );
  };

  const renderItem = (item: RiskAssessmentsType, statusColor) => {
    return (
      <ProductName>
        {item && item?.name}
        <ColorBox color={statusColor && statusColor} />
      </ProductName>
    );
  };

  const renderSubmissionForm = ({
    isSubmitted,
    email,
    riskAssessmentId
  }: {
    isSubmitted?: boolean;
    email: string;
    riskAssessmentId?: string;
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
      if (conformity?.status === 'In Progress') {
        return (
          <Button btnStyle="link">
            <Tip text="In Progress" placement="bottom">
              <Icon icon="loading" />
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
        riskAssessmentId: riskAssessmentId,
        refetchSubmissions: props.refetchSubmissions,
        isSubmitted: isSubmitted
      };

      return <Submissions {...updateProps} />;
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
    if (!conformity) {
      return <EmptyState icon="folder-2" text={`No risk assessment`} />;
    }

    return (
      <div>
        {
          <SectionBodyItem key={conformity?.riskAssessmentId}>
            {renderChooserModal(
              renderItem(conformity?.riskAssessment, conformity?.statusColor),
              conformity?.riskAssessmentId
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
            riskAssessmentId: conformity?.riskAssessmentId
          })}
        </ProductName>
      </SectionBodyItem>
    ));
  };

  return (
    <>
      <Box
        name="riskAssessment"
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
