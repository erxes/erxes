import { SectionBodyItem, __ } from '@erxes/ui/src';
import {
  Box,
  Button,
  EmptyState,
  Icon,
  ModalTrigger,
  Tip
} from '@erxes/ui/src/components';
import React from 'react';
import { ICardRiskAssements, RiskAssessmentsType } from '../../common/types';
import { ColorBox, ProductName } from '../../styles';
import RiskAssessmentForm from '../container/Form';
import Submissions from '../container/Submissions';
type Props = {
  conformity: ICardRiskAssements;
  refetch: () => void;
  refetchSubmissions: () => void;
  submissions: any;
  cardId: string;
  cardType: string;
  currentUser: any;
};

function RiskAssessmentSection(props: Props) {
  const { conformity, submissions, currentUser } = props;

  const renderFormModalContent = ({
    closeModal,
    riskAssessmentId
  }: {
    closeModal: () => void;
    cardId?: string;
    riskAssessmentId?: string;
  }) => {
    return (
      <RiskAssessmentForm
        {...props}
        closeModal={closeModal}
        riskAssessmentId={riskAssessmentId}
      />
    );
  };

  const renderFormModal = (
    trigger: React.ReactNode,
    riskAssessmentId?: string
  ) => {
    return (
      <ModalTrigger
        size="lg"
        trigger={trigger}
        content={props =>
          renderFormModalContent({
            ...props,
            riskAssessmentId
          })
        }
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

  const renderSubmissionForm = (
    isSubmitted?: boolean,
    riskAssessmentId?: string
  ) => {
    const trigger = (
      <Button btnStyle="link">
        <Tip text={isSubmitted ? 'See Submitted Form' : 'Submission Form'}>
          <Icon
            color={isSubmitted ? 'purple' : 'green'}
            icon={isSubmitted ? 'file-edit-alt' : 'file-alt'}
          />
        </Tip>
      </Button>
    );

    const content = ({ closeModal }) => {
      return (
        <Submissions
          cardId={props.cardId}
          cardType={props.cardType}
          currentUserId={props.currentUser._id}
          closeModal={closeModal}
          refetch={props.refetch}
          riskAssessmentId={riskAssessmentId}
          refetchSubmissions={props.refetchSubmissions}
          isSubmitted={isSubmitted}
        />
      );
    };

    return (
      <ModalTrigger
        title="Your Risk Assessment Submission Form"
        trigger={trigger}
        content={content}
        backDrop
        isAnimate
      />
    );
  };

  return (
    <>
      <Box
        name="riskAssessment"
        title={__('Risk Assessment')}
        extraButtons={renderFormModal(
          <button>
            <Icon icon="plus-circle" />
          </button>
        )}
      >
        {conformity ? (
          <div>
            {
              <SectionBodyItem key={conformity.riskAssessmentId}>
                {renderFormModal(
                  renderItem(
                    conformity.riskAssessment,
                    conformity?.statusColor
                  ),
                  conformity.riskAssessmentId
                )}
              </SectionBodyItem>
            }
          </div>
        ) : (
          <EmptyState icon="folder-2" text={`No risk assessment`} />
        )}
      </Box>
      {conformity && (
        <Box name="riskSubmissions" title={__('Risk Assessment Submissions')}>
          {submissions ? (
            submissions.map(user => (
              <SectionBodyItem key={user._id}>
                <ProductName>
                  {user.email}
                  {currentUser.email === user.email &&
                    renderSubmissionForm(
                      user.isSubmittedRiskAssessmentForm,
                      conformity?.riskAssessmentId
                    )}
                </ProductName>
              </SectionBodyItem>
            ))
          ) : (
            <EmptyState
              icon="folder-2"
              text={`No risk assessment submission`}
            />
          )}
        </Box>
      )}
    </>
  );
}

export default RiskAssessmentSection;
