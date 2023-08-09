import React from 'react';
import { IGrantRequest } from '../../common/type';
import {
  Box,
  Button,
  EmptyState,
  Icon,
  ModalTrigger,
  NameCard,
  SectionBodyItem,
  colors
} from '@erxes/ui/src';
import Form from '../containers/RequestForm';
import { IUser } from '@erxes/ui/src/auth/types';
import { AssignedMemberCard, SectionContent } from '../../styles';
import ResponseForm from '../containers/ResponseForm';
import _loadash from 'lodash';

type Props = {
  request: IGrantRequest;
  contentType: string;
  contentTypeId: string;
  object: any;
  currentUser: IUser;
};

class Section extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  renderForm(user: { grantResponse?: string } & IUser) {
    const { currentUser, request, contentTypeId, contentType } = this.props;

    if (
      currentUser._id === user._id &&
      currentUser._id !== request.requesterId &&
      (request?.userIds || []).includes(currentUser._id) &&
      request.status === 'waiting' &&
      user.grantResponse === 'waiting'
    ) {
      const trigger = (
        <Button btnStyle="link">
          <Icon icon="feedback" color={colors.colorCoreBlue} />
        </Button>
      );

      const content = props => {
        const updatedProps = {
          ...props,
          contentTypeId,
          contentType,
          requestId: request._id
        };

        return <ResponseForm {...updatedProps} />;
      };

      return (
        <ModalTrigger
          title="Response on Request"
          content={content}
          trigger={trigger}
        />
      );
    }

    switch (user.grantResponse || '') {
      case 'approved':
        return (
          <Icon
            icon="like-1"
            color={colors.colorCoreGreen}
            style={{ padding: '7px 20px' }}
          />
        );
      case 'declined':
        return (
          <Icon
            icon="dislike"
            color={colors.colorCoreRed}
            style={{ padding: '7px 20px' }}
          />
        );
      case 'waiting':
        return (
          <Icon
            icon="clock"
            color={colors.colorCoreBlue}
            style={{ padding: '7px 20px' }}
          />
        );
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
      <SectionBodyItem key={user._id}>
        <AssignedMemberCard>
          <NameCard user={user} />
          {this.renderForm(user)}
        </AssignedMemberCard>
      </SectionBodyItem>
    ));
  }

  renderRequestForm() {
    const {
      contentType,
      contentTypeId,
      object,
      currentUser,
      request
    } = this.props;

    if (!_loadash.isEmpty(request) && currentUser._id !== request.requesterId) {
      return null;
    }

    const trigger = (
      <button>
        <Icon icon={!!Object.keys(request).length ? 'edit-3' : 'plus-circle'} />
      </button>
    );

    const updatedProps = {
      currentUser,
      contentType,
      contentTypeId,
      object,
      request
    };

    const content = props => <Form {...props} {...updatedProps} />;

    return (
      <ModalTrigger
        title="Send Grant Request"
        trigger={trigger}
        content={content}
        size="lg"
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
