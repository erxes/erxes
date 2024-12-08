import * as React from 'react';
import * as RTG from 'react-transition-group';
import { IParticipator, IUser } from '../../types';
import BrandInfo from '../containers/common/BrandInfo';
import Profile from './common/Profile';
import Supporters from './common/Supporters';

type Props = {
  supporters: IUser[];
  participators: IParticipator[];
  isOnline: boolean;
  color?: string;
  loading?: boolean;
  showTimezone?: boolean;
};

class ConversationHeadContent extends React.Component<Props> {
  withTransition(children: any, visible: boolean) {
    return (
      <RTG.CSSTransition
        in={visible}
        timeout={300}
        classNames="fade-slide"
        unmountOnExit={true}
      >
        {children}
      </RTG.CSSTransition>
    );
  }

  withComponent(isExpanded: boolean) {
    const {
      supporters,
      isOnline,
      color,
      loading,
      participators,
      showTimezone,
    } = this.props;

    let content = (
      <>
        {isExpanded && <BrandInfo />}
        <Supporters
          users={supporters}
          loading={loading}
          isOnline={isOnline}
          color={color}
          isExpanded={isExpanded}
        />
      </>
    );

    if (participators.length) {
      content = (
        <Profile
          user={participators[0]}
          isOnline={isOnline}
          isExpanded={isExpanded}
          showTimezone={showTimezone}
        />
      );
    }

    return (
      <div className={`erxes-head-${isExpanded ? 'expanded' : 'collapsed'}`}>
        {content}
      </div>
    );
  }

  render() {
    return this.withComponent(false);
  }
}

export default ConversationHeadContent;
