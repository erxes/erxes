import { getEnv, SectionBodyItem, __ } from '@erxes/ui/src';
import {
  Box,
  Button,
  EmptyState,
  Icon,
  ModalTrigger,
  Tip,
} from '@erxes/ui/src/components';
import React from 'react';
import { IDealRiskAssements } from '../../common/types';
import { ProductName } from '../../styles';
import RiskAssessmentForm from '../container/Form';
type Props = {
  list: IDealRiskAssements[];
  refetch: () => void;
  submissions: any;
};

function RiskAssessmentSection(props: Props) {
  const { list, submissions } = props;

  const renderFormModalContent = ({
    closeModal,
    riskAssessmentId,
  }: {
    closeModal: () => void;
    dealId?: string;
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
        size='lg'
        trigger={trigger}
        content={(props) =>
          renderFormModalContent({ ...props, riskAssessmentId })
        }
        title='Risk Assessment'
      />
    );
  };

  const renderItem = (text: string) => {
    return <ProductName>{text}</ProductName>;
  };

  const handleSumbmissionForm = () => {
    const { REACT_APP_CDN_HOST } = getEnv();

    window.open(
      `${REACT_APP_CDN_HOST}/test?type=form&brand_id=Ca8LyB&form_id=e25o9Q`
    );
  };

  return (
    <>
      <Box
        name='riskAssessment'
        title={__('Risk Assessment')}
        extraButtons={renderFormModal(
          <button>
            <Icon icon='plus-circle' />
          </button>
        )}
      >
        {list.length ? (
          <div>
            {list.map((item) => (
              <SectionBodyItem key={item.riskAssessmentId}>
                {renderFormModal(
                  renderItem(item.name || ''),
                  item.riskAssessmentId
                )}
              </SectionBodyItem>
            ))}
          </div>
        ) : (
          <EmptyState icon='folder-2' text={`No risk assessment`} />
        )}
      </Box>
      {list.length > 0 && (
        <Box name='riskSubmissions' title={__('Submissions')}>
          {submissions ? (
            submissions.map((user) => (
              <SectionBodyItem key={user._id}>
                <ProductName>
                  {user.email}
                  <Button btnStyle='link' onClick={handleSumbmissionForm}>
                    <Tip text='Submission Form'>
                      <Icon icon='file-alt' />
                    </Tip>
                  </Button>
                </ProductName>
              </SectionBodyItem>
            ))
          ) : (
            <EmptyState
              icon='folder-2'
              text={`No risk assessment submissions`}
            />
          )}
        </Box>
      )}
    </>
  );
}

export default RiskAssessmentSection;
