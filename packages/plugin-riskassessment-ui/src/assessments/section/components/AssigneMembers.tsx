import {
  Box,
  Button,
  colors,
  EmptyState,
  Icon,
  ModalTrigger,
  NameCard,
  SectionBodyItem
} from '@erxes/ui/src';
import { IUser } from '@erxes/ui/src/auth/types';
import ErrorBoundary from '@erxes/ui/src/components/ErrorBoundary';
import React from 'react';
import { ProductName } from '../../../styles';
import {
  RiskAssessmentAssignedMembers,
  RiskAssessmentTypes
} from '../../common/types';
import RiskAssessmentForm from '../containers/RiskAssessmentForm';
import MultipleAssessment from './MultipleAssessmentForm';

type Props = {
  assignedMembers: RiskAssessmentAssignedMembers[];
  currentUser: IUser;
  cardId: string;
  cardType: string;
  riskAssessments: RiskAssessmentTypes[];
};

class AssignedMembers extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  renderSubmitForm({ userId, submitStatus }) {
    const { currentUser, cardId, cardType, riskAssessments } = this.props;
    const renderStatusIcon = () => {
      if (currentUser._id === userId) {
        switch (submitStatus) {
          case 'inProgress':
            return <Icon icon="file-edit-alt" color={colors.colorCoreBlue} />;
          case 'pending':
            return <Icon icon="file-info-alt" color={colors.colorCoreOrange} />;
          case 'submitted':
            return <Icon icon="file-check" color={colors.colorCoreGreen} />;
          default:
            return;
        }
      }

      switch (submitStatus) {
        case 'inProgress':
          return <Icon icon="loading" />;
        case 'pending':
          return <Icon icon="wallclock" />;
        case 'submitted':
          return <Icon icon="checked" />;
        default:
          return;
      }
    };

    const trigger = <Button btnStyle="link">{renderStatusIcon()}</Button>;

    const content = props => {
      const updatedProps = {
        ...props,
        filters: {
          cardId,
          cardType,
          userId: currentUser._id
        },

        onlyPreview: currentUser._id !== userId
      };

      if (riskAssessments.length > 1) {
        return (
          <MultipleAssessment
            {...updatedProps}
            riskAssessments={riskAssessments}
          />
        );
      }

      return (
        <RiskAssessmentForm
          {...{
            ...updatedProps,
            filters: {
              ...updatedProps.filters,
              riskAssessmentId: riskAssessments[0]._id
            }
          }}
        />
      );
    };

    return (
      <ModalTrigger
        content={content}
        trigger={trigger}
        title="Risk Indicators Submit Form"
        size="xl"
        enforceFocus={false}
        style={{ overflow: 'auto' }}
      />
    );
  }

  render() {
    const { assignedMembers } = this.props;

    if (!assignedMembers.length) {
      return (
        <Box title="Risk Assessment Assigned Members">
          <EmptyState
            text="No member assigned in risk assessment"
            icon="users"
          />
        </Box>
      );
    }

    return (
      <Box title="Risk Assessment Assigned Members" name="assignedMembers">
        <ErrorBoundary>
          {assignedMembers.map(assignedMember => (
            <SectionBodyItem key={assignedMember._id}>
              <ProductName>
                <NameCard user={assignedMember} />
                {this.renderSubmitForm({
                  userId: assignedMember._id,
                  submitStatus: assignedMember?.submitStatus
                })}
              </ProductName>
            </SectionBodyItem>
          ))}
        </ErrorBoundary>
      </Box>
    );
  }
}

export default AssignedMembers;
