import React from 'react';

type Props = {
  action: any;
  handle: (id: number) => JSX.Element;
};

class OptionalContent extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  renderMessageTemplatesOptions(messageTemplates) {
    const { handle } = this.props;

    return (
      <>
        {messageTemplates.map(msgTemplate =>
          (msgTemplate?.buttons || []).map(({ _id, text }) => {
            return (
              <li key={`${_id}-right`}>
                {text}
                {handle(_id)}
              </li>
            );
          })
        )}
      </>
    );
  }

  renderQuickReplies(quickReplies) {
    const { handle } = this.props;
    return (
      <>
        {quickReplies.map(quickReply => (
          <li key={`${quickReply._id}-right`}>
            {quickReply?.label}
            {handle(quickReply._id)}
          </li>
        ))}
      </>
    );
  }

  renderContent(messageTemplates, quickReplies) {
    if (messageTemplates?.length > 0) {
      return this.renderMessageTemplatesOptions(messageTemplates);
    }

    if (quickReplies?.length > 0) {
      return this.renderQuickReplies(quickReplies);
    }
    return null;
  }

  render() {
    const { action } = this.props;

    const { messageTemplates = [], quickReplies = [] } = action?.config || {};

    return this.renderContent(messageTemplates, quickReplies);
  }
}

export default OptionalContent;
