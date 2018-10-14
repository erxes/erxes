import * as React from "react";
import * as RTG from "react-transition-group";
import { IParticipator, IUser } from "../../types";
import { __ } from "../../utils";
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
};

class ConversatioHeadContent extends React.Component<Props> {
  withTransition(children: any, visible: boolean) {
    return (
      <RTG.CSSTransition
        in={visible}
        timeout={300}
        classNames="fade-slide"
        unmountOnExit
        onExit={() => {
          this.props.toggleExpand();
        }}
      >
        {children}
      </RTG.CSSTransition>
    );
  }

  withComponent(isExpanded: boolean) {
    const { supporters, isOnline, color, loading, participators } = this.props;

    let content = (
      <React.Fragment>
        {isExpanded && <BrandInfo />}
        <Supporters
          users={supporters}
          loading={loading}
          isOnline={isOnline}
          color={color}
          isExpanded={isExpanded}
        />
      </React.Fragment>
    );

    if (participators.length) {
      content = (
        <Profile
          user={participators[0]}
          isOnline={isOnline}
          isExpanded={isExpanded}
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
      <React.Fragment>
        {this.withTransition(this.withComponent(true), expanded)}
        {this.withTransition(this.withComponent(false), !expanded)}
      </React.Fragment>
    );
  }
}

export default ConversatioHeadContent;
