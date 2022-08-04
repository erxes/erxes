import * as React from "react";
import * as RTG from "react-transition-group";
import { IParticipator, IUser } from "../../types";
import { BrandInfo } from "../containers/common";
import { Profile, Supporters } from "./common";

type Props = {
  supporters: IUser[];
  participators: IParticipator[];
  isOnline: boolean;
  color?: string;
  loading?: boolean;
  expanded: boolean;
  toggleExpand: () => void;
  showTimezone?: boolean;
  serverTime?: string;
};

class ConversationHeadContent extends React.Component<Props> {
  withTransition(children: any, visible: boolean) {
    return (
      <RTG.CSSTransition
        in={visible}
        timeout={300}
        classNames="fade-slide"
        unmountOnExit={true}
        onExit={() => {
          this.props.toggleExpand();
        }}
      >
        {children}
      </RTG.CSSTransition>
    );
  }

  withComponent(isExpanded: boolean) {
    const { supporters, isOnline, color, loading, participators, showTimezone, serverTime } = this.props;

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
          serverTime={serverTime}
        />
      );
    }

    return (
      <div className={`erxes-head-${isExpanded ? "expanded" : "collapsed"}`}>
        {content}
      </div>
    );
  }

  render() {
    const { expanded } = this.props;

    return (
      <>
        {this.withTransition(this.withComponent(true), expanded)}
        {this.withTransition(this.withComponent(false), !expanded)}
      </>
    );
  }
}

export default ConversationHeadContent;
