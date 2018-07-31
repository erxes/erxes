import * as React from 'react';
import * as striptags from 'striptags';
import { User } from '../components';
import { iconClose } from '../../icons/Icons';
import { IUser } from '../../types';
import { IEngageData } from '../types';

const Fragment = React.Fragment;
const Component = React.Component;

type Props = {
  engageData: IEngageData,
  toggle?: () => void,
}

class EngageMessage extends Component<Props> {
  renderClose() {
    return (
      <a
        href="#"
        className="close-notification"
        onClick={this.props.toggle}
        title="Close notification"
      >
        {iconClose}
      </a>
    );
  }

  renderUserFullName(fromUser?: IUser) {
    if (fromUser && fromUser.details) {
       return fromUser.details.fullName
    }
  }

  renderNotificationContent() {
    const { content, sentAs, fromUser } = this.props.engageData;
    const bodyClass = `notification-body ${sentAs}`;

    if (sentAs === 'badge') {
      return null;
    }

    return (
      <Fragment>
        <div className="flex-notification">
          <div className="user-info">
            <User user={fromUser} />
            {this.renderUserFullName(fromUser)}
          </div>
          <div className={bodyClass}>
            {
              sentAs === 'fullMessage' ?
                <span dangerouslySetInnerHTML={{ __html: content }} /> :
                striptags(content)
            }
          </div>
        </div>
        {this.renderClose()}
      </Fragment>
    );
  }

  render() {
    return this.renderNotificationContent();
  }
}

export default EngageMessage;
