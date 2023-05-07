import React from 'react';
import { IGrantRequest } from '../../common/section/type';
import {
  Box,
  Button,
  EmptyState,
  Icon,
  ModalTrigger,
  NameCard,
  colors
} from '@erxes/ui/src';
import Form from '../containers/RequestForm';
import { IUser } from '@erxes/ui/src/auth/types';
import { SectionContent } from '../../styles';

type Props = {
  request: IGrantRequest;
  cardType: string;
  cardId: string;
  object: any;
  currentUser: IUser;
};

class Section extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  renderForm(user: { grantResponse?: string } & IUser) {
    const { currentUser, request } = this.props;

    if (
      currentUser._id !== request.requesterId &&
      (request?.userIds || []).includes(currentUser._id)
    ) {
    }

    switch (user.grantResponse || '') {
      case 'agreed':
        return <Icon icon="like-1" color={colors.colorCoreGreen} />;
      case 'declined':
        return <Icon icon="dislike" color={colors.colorCoreRed} />;
      case 'waiting':
        return <Icon icon="clock" color={colors.colorCoreBlue} />;
    }
  }

  renderContent() {
    const {
      request: { users }
    } = this.props;

    if (!users?.length) {
      return <EmptyState text="There has no grant request" icon="list-ul" />;
    }

    return users.map(user => (
      <SectionContent key={user._id}>
        <NameCard user={user} />
        {this.renderForm(user)}
      </SectionContent>
    ));
  }

  renderRequestForm() {
    const { cardType, cardId, object, currentUser, request } = this.props;

    const trigger = (
      <button>
        <Icon icon={!!Object.keys(request).length ? 'edit-3' : 'plus-circle'} />
      </button>
    );

    const updatedProps = {
      currentUser,
      cardType,
      cardId,
      object,
      request
    };

    const content = props => <Form {...props} {...updatedProps} />;

    return (
      <ModalTrigger
        title="Send Grant Request"
        trigger={trigger}
        content={content}
      />
    );
  }

  render() {
    return (
      <Box
        title="Grant Request"
        name="grantSection"
        isOpen={true}
        extraButtons={this.renderRequestForm()}
      >
        {this.renderContent()}
      </Box>
    );
  }
}

export default Section;
