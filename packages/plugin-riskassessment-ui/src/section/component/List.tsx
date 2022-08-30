import { SectionBodyItem, __ } from '@erxes/ui/src'
import { Box, EmptyState, Icon, ModalTrigger } from '@erxes/ui/src/components'
import React from 'react'
import { IDealRiskAssements } from '../../common/types'
import { ProductName } from '../../styles'
import RiskAssessmentForm from '../container/Form'
type Props = {
  list: IDealRiskAssements[];
  refetch: () => void;
};

function RiskAssessmentSection(props: Props) {
  const { list } = props;

  const renderFormModalContent = ({
    closeModal,
    riskAssessmentId,
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
        content={(props) => renderFormModalContent({ ...props, riskAssessmentId })}
        title="Risk Assessment"
      />
    );
  };

  const renderItem = (text: string) => {
    return <ProductName>{text}</ProductName>;
  };

//   const sendRiskAssessmentForm = () =>{
//     const variables = {
//       assinedUsersIds: assignedUsers?.map(user=>user._id),
//       riskAssessmentId:list[0].riskAssessmentId
//     }
// }

  return (
    <Box
      name="showRiskAssessment"
      title={__('Risk Assessment')}
      extraButtons={renderFormModal(
        <button>
          <Icon icon="plus-circle" />
        </button>
      )}
    >
      {list.length ? (
        <div>
          {list.map((item) => (
            <SectionBodyItem key={item.riskAssessmentId}>
              {renderFormModal(renderItem(item.name || ''), item.riskAssessmentId)}
            </SectionBodyItem>
          ))}
        </div>
      ) : (
        <EmptyState icon="folder-2" text={`No risk assessment`} />
      )}
      {/* {
        assignedUsers?.length &&(
          <div>
            <ButtonRelated>
              <span>
               Send form to assigned users
              </span>
            </ButtonRelated>
          </div>
        )
      } */}
    </Box>
  );
}

export default RiskAssessmentSection;
