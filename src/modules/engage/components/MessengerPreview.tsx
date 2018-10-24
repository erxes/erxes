import { IUser } from 'modules/auth/types';
import { NameCard } from 'modules/common/components';
import { WidgetPreviewStyled } from 'modules/settings/integrations/components/messenger/widgetPreview/styles';
import { LogoContainer } from 'modules/settings/styles';
import * as React from 'react';
import strip from 'strip';
import * as xss from 'xss';
import { Messenger, PreviewContent, WebPreview } from '../styles';

type Props = {
  content?: string;
  user: IUser;
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
    const { content, sentAs } = this.props;

    const type = sentAs ? sentAs : 'default';
    const classNames = `engage-message type-${type}`;
    const isFullmessage = sentAs === 'fullMessage';

    if (sentAs === 'badge') {
      return null;
    }

    return (
      <WidgetPreviewStyled className={classNames}>
        <NameCard user={this.props.user} singleLine={true} />
        <PreviewContent
          isFullmessage={isFullmessage}
          dangerouslySetInnerHTML={{
            __html: isFullmessage ? xss(content || '') : xss(strip(content))
          }}
        />
      </WidgetPreviewStyled>
    );
  };

  render() {
    const { sentAs } = this.props;

    return (
      <WebPreview className={`type-${sentAs}`}>
        <Messenger>
          {this.renderNotificationBody()}
          <LogoContainer>
            <span>1</span>
          </LogoContainer>
        </Messenger>
      </WebPreview>
    );
  }
}

export default MessengerPreview;
