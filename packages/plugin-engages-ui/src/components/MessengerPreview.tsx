import NameCard from 'erxes-ui/lib/components/nameCard/NameCard';
import React from 'react';
import strip from 'strip';
import xss from 'xss';
import {
  LauncherContainer,
  PreviewContent,
  WebPreview,
  WidgetPreview
} from '../styles';

type Props = {
  content?: string;
  user?: any;
  sentAs?: string;
};

type State = {
  fromUser: string;
};

class MessengerPreview extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { fromUser: '' };
  }

  renderNotificationBody = () => {
    const { content, sentAs, user } = this.props;

    const type = sentAs ? sentAs : 'default';
    const classNames = `engage-message type-${type}`;
    const isFullmessage = sentAs === 'fullMessage';

    if (sentAs === 'badge') {
      return null;
    }

    return (
      <WidgetPreview className={classNames}>
        {user ? <NameCard user={user} singleLine={true} /> : null}
        <PreviewContent
          isFullmessage={isFullmessage}
          dangerouslySetInnerHTML={{
            __html: isFullmessage ? xss(content || '') : xss(strip(content))
          }}
        />
      </WidgetPreview>
    );
  };

  render() {
    const { sentAs } = this.props;

    return (
      <WebPreview className={`type-${sentAs}`} isEngage={true}>
        {this.renderNotificationBody()}

        <LauncherContainer>
          <span>1</span>
        </LauncherContainer>
      </WebPreview>
    );
  }
}

export default MessengerPreview;
