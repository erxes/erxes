import {
  EmptyState,
  NameCard,
  SectionBodyItem,
  Box,
  Icon,
  Button,
  ModalTrigger,
  colors
} from '@erxes/ui/src';
import { IUser } from '@erxes/ui/src/auth/types';
import React from 'react';
import { FormContainer, ProductName } from '../../../styles';

type Props = {
  assignedMembers: any[];
  currentUser: IUser;
};

class AssignedMembers extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  renderSubmitForm({ userId, submitStatus }) {
    const { currentUser } = this.props;
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

    const content = props => <div>dsa</div>;

    return (
      <ModalTrigger content={content} trigger={trigger} title="Hello World" />
    );
  }

  render() {
    const { assignedMembers } = this.props;

    if (!assignedMembers.length) {
      return <EmptyState text="No member assigned in risk assessment" />;
    }

    return (
      <Box title="Risk Assessment Assigned Members">
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
      </Box>
    );
  }
}

export default AssignedMembers;
