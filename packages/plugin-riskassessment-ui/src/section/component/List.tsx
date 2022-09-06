import { getEnv, SectionBodyItem, __ } from '@erxes/ui/src';
import { Box, Button, EmptyState, Icon, ModalTrigger, Tip } from '@erxes/ui/src/components';
import React from 'react';
import { IDealRiskAssements } from '../../common/types';
import { ProductName } from '../../styles';
import RiskAssessmentForm from '../container/Form';
import Submissions from '../container/Submissions';
type Props = {
  list: IDealRiskAssements[];
  refetch: () => void;
  submissions: any;
  id: string;
  currentUser: any;
};

function RiskAssessmentSection(props: Props) {
  const { list, submissions } = props;

  const renderFormModalContent = ({
    closeModal,
    riskAssessmentId
  }: {
    closeModal: () => void;
    dealId?: string;
    riskAssessmentId?: string;
  }) => {
    return (
      <RiskAssessmentForm {...props} closeModal={closeModal} riskAssessmentId={riskAssessmentId} />
    );
  };

  const renderFormModal = (trigger: React.ReactNode, riskAssessmentId?: string) => {
    return (
      <ModalTrigger
        size="lg"
        trigger={trigger}
        content={props => renderFormModalContent({ ...props, riskAssessmentId })}
        title="Risk Assessment"
      />
    );
  };

  const renderItem = (text: string) => {
    return <ProductName>{text}</ProductName>;
  };

  const renderSubmissionForm = (isSubmitted?: boolean) => {
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
          cardId={props.id}
          currentUserId={props.currentUser._id}
          closeModal={closeModal}
          refetch={props.refetch}
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
        {list.length ? (
          <div>
            {list.map(item => (
              <SectionBodyItem key={item.riskAssessmentId}>
                {renderFormModal(renderItem(item.name || ''), item.riskAssessmentId)}
              </SectionBodyItem>
            ))}
          </div>
        ) : (
          <EmptyState icon="folder-2" text={`No risk assessment`} />
        )}
      </Box>
      {list.length > 0 && (
        <Box name="riskSubmissions" title={__('Risk Assessment Submissions')}>
          {submissions ? (
            submissions.map(user => (
              <SectionBodyItem key={user._id}>
                <ProductName>
                  {user.email}
                  {renderSubmissionForm(user.isSubmittedRiskAssessmentForm)}
                </ProductName>
              </SectionBodyItem>
            ))
          ) : (
            <EmptyState icon="folder-2" text={`No risk assessment submissions`} />
          )}
        </Box>
      )}
    </>
  );
}

export default RiskAssessmentSection;
