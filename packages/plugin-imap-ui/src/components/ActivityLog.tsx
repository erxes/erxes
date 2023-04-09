import React from 'react';

type Props = {
  contentType: string;
  activity: any;
  currentUser: any;
};

class ActivityItem extends React.Component<Props> {
  render() {
    const { activity } = this.props;
    const { contentTypeDetail } = activity;
    const { body, subject } = contentTypeDetail;

    return (
      <div>
        <span>
          <strong>Sent an email</strong>
        </span>

        <p>
          <span>Subject:</span>
          <div>{subject}</div>
        </p>

        <p>
          <span>Content:</span>
          <div dangerouslySetInnerHTML={{ __html: body }} />
        </p>
      </div>
    );
  }
}

export default ActivityItem;
