import {
  AWS_EMAIL_DELIVERY_STATUSES,
  METHODS,
  NOTIFICATION_DELIVERY_STATUSES,
  SMS_DELIVERY_STATUSES,
} from "@erxes/ui-engage/src/constants";
import {
  FlexContainer,
  Half,
  InfoWrapper,
  PreviewContent,
  RightSection,
  Title,
} from "@erxes/ui-engage/src/styles";
import {
  FlexRow,
  Subject,
} from "@erxes/ui-inbox/src/settings/integrations/components/mail/styles";
import {
  IEngageMessage,
  IEngageSmsStats,
  IEngageStats,
} from "@erxes/ui-engage/src/types";

import Attachment from "@erxes/ui/src/components/Attachment";
import EngageLogsContainer from "../containers/EngageLogsContainer";
import React from "react";
import StatItem from "./EngageStatItem";
import Wrapper from "@erxes/ui/src/layout/components/Wrapper";
import { __ } from "coreui/utils";
import dayjs from "dayjs";

type Props = {
  message: IEngageMessage;
};

class EmailStatistics extends React.Component<Props> {
  renderBox(method: string, count: number, totalCount?: number, kind?: string) {
    return (
      <StatItem
        count={count}
        totalCount={totalCount}
        method={method}
        kind={kind}
      />
    );
  }

  renderEmailBox(count: number, totalCount?: number, kind?: string) {
    return this.renderBox(METHODS.EMAIL, count, totalCount, kind);
  }

  renderSmsBox(count: number, totalCount?: number, kind?: string) {
    return this.renderBox(METHODS.SMS, count, totalCount, kind);
  }

  renderNotificationBox(count: number, totalCount?: number, kind?: string) {
    return this.renderBox(METHODS.NOTIFICATION, count, totalCount, kind);
  }

  renderAttachments() {
    const { email } = this.props.message;

    if (!email || (email.attachments && email.attachments.length === 0)) {
      return null;
    }

    return (
      <Subject noBorder={true}>
        <FlexRow>
          <label>Attachments:</label>

          {(email.attachments || []).map((attachment, index) => (
            <Attachment key={index} attachment={attachment} />
          ))}
        </FlexRow>
      </Subject>
    );
  }

  getSubject() {
    const { message } = this.props;
    if (message.method === METHODS.EMAIL) {
      return message.email && message.email.subject;
    }

    if (message.method === METHODS.SMS) {
      return message.shortMessage && message.shortMessage.from;
    }

    if (message.method === METHODS.NOTIFICATION) {
      return message.notification && message.notification.title;
    }

    return null;
  }

  getContent() {
    const { message } = this.props;

    if (message.method === METHODS.EMAIL) {
      return message.email && message.email.content;
    }

    if (message.method === METHODS.SMS) {
      return message.shortMessage && message.shortMessage.content;
    }

    if (message.method === METHODS.NOTIFICATION) {
      return message.notification && message.notification.content;
    }

    return "";
  }

  renderNotification() {
    const { message } = this.props;
    const { notification } = message;
    return (
      <Half>
        <Subject>
          <FlexRow>
            <label>{__("Notification title")}:</label>
            <strong>{notification && notification.title}</strong>
          </FlexRow>
          <FlexRow>
            <label>{__("Is mobile")}:</label>
            <strong>
              {notification && notification.isMobile ? "true" : "false"}
            </strong>
          </FlexRow>
          <FlexRow>
            <label>{__("Notification content")}:</label>
            <PreviewContent
              $isFullmessage={false}
              $showOverflow={true}
              dangerouslySetInnerHTML={{
                __html: this.getContent() || "",
              }}
            />
          </FlexRow>
          <FlexRow>
            <label>{__("Recipients")}:</label>
            <strong>{message.totalCustomersCount}</strong>
          </FlexRow>
          <FlexRow>
            <label>{__("Created at")}:</label>
            <strong>
              {" "}
              {dayjs(message.createdAt).format("DD MMM YYYY, HH:MM")}
            </strong>
          </FlexRow>
        </Subject>
      </Half>
    );
  }

  renderLeft() {
    const { message } = this.props;
    const { fromIntegration, fromUser } = message;

    let from;

    if (fromUser) {
      from = fromUser.details ? fromUser.details.fullName : fromUser.email;
    }

    if (fromIntegration) {
      from = fromIntegration.name;
    }
    if (message.method === METHODS.NOTIFICATION) {
      return this.renderNotification();
    }

    return (
      <Half>
        <Subject>
          <FlexRow>
            <label>{__("From")}:</label>
            <strong>{from}</strong>
          </FlexRow>
        </Subject>
        <Subject>
          <FlexRow>
            <label>{__("Subject")}:</label>
            {this.getSubject()}
          </FlexRow>
        </Subject>
        <Subject noBorder={true}>
          <FlexRow>
            <label>{__("Content")}:</label>
          </FlexRow>
          <PreviewContent
            $isFullmessage={false}
            $showOverflow={true}
            dangerouslySetInnerHTML={{
              __html: this.getContent() || "",
            }}
          />
        </Subject>

        {this.renderAttachments()}
      </Half>
    );
  }

  renderEmailStats() {
    const { stats } = this.props.message;
    const emailStats = stats || ({} as IEngageStats);

    if (this.props.message.method !== METHODS.EMAIL) {
      return null;
    }

    return (
      <React.Fragment>
        {this.renderEmailBox(emailStats.total)}
        {this.renderEmailBox(
          emailStats.send,
          emailStats.total,
          AWS_EMAIL_DELIVERY_STATUSES.SEND
        )}
        {this.renderEmailBox(
          emailStats.delivery,
          emailStats.total,
          AWS_EMAIL_DELIVERY_STATUSES.DELIVERY
        )}
        {this.renderEmailBox(
          emailStats.open,
          emailStats.total,
          AWS_EMAIL_DELIVERY_STATUSES.OPEN
        )}
        {this.renderEmailBox(
          emailStats.click,
          emailStats.total,
          AWS_EMAIL_DELIVERY_STATUSES.CLICK
        )}
        {this.renderEmailBox(
          emailStats.complaint,
          emailStats.total,
          AWS_EMAIL_DELIVERY_STATUSES.COMPLAINT
        )}
        {this.renderEmailBox(
          emailStats.bounce,
          emailStats.total,
          AWS_EMAIL_DELIVERY_STATUSES.BOUNCE
        )}
        {this.renderEmailBox(
          emailStats.renderingfailure,
          emailStats.total,
          AWS_EMAIL_DELIVERY_STATUSES.RENDERING_FAILURE
        )}
        {this.renderEmailBox(
          emailStats.reject,
          emailStats.total,
          AWS_EMAIL_DELIVERY_STATUSES.REJECT
        )}
      </React.Fragment>
    );
  }

  renderSmsStats() {
    const { smsStats } = this.props.message;
    const stats = smsStats || ({} as IEngageSmsStats);

    if (this.props.message.method !== METHODS.SMS) {
      return null;
    }

    return (
      <React.Fragment>
        {this.renderSmsBox(stats.total)}
        {this.renderSmsBox(
          stats.queued,
          stats.total,
          SMS_DELIVERY_STATUSES.QUEUED
        )}
        {this.renderSmsBox(
          stats.sending,
          stats.total,
          SMS_DELIVERY_STATUSES.SENDING
        )}
        {this.renderSmsBox(stats.sent, stats.total, SMS_DELIVERY_STATUSES.SENT)}
        {this.renderSmsBox(
          stats.delivered,
          stats.total,
          SMS_DELIVERY_STATUSES.DELIVERED
        )}
        {this.renderSmsBox(
          stats.sending_failed,
          stats.total,
          SMS_DELIVERY_STATUSES.SENDING_FAILED
        )}
        {this.renderSmsBox(
          stats.delivery_failed,
          stats.total,
          SMS_DELIVERY_STATUSES.DELIVERY_FAILED
        )}
        {this.renderSmsBox(
          stats.delivery_unconfirmed,
          stats.total,
          SMS_DELIVERY_STATUSES.DELIVERY_UNCONFIRMED
        )}
      </React.Fragment>
    );
  }

  renderNotificationsStats() {
    const { totalCustomersCount, notificationStats } = this.props.message;
    if (this.props.message.method !== METHODS.NOTIFICATION) {
      return null;
    }

    return (
      <React.Fragment>
        {this.renderNotificationBox(
          totalCustomersCount || 0,
          undefined,
          NOTIFICATION_DELIVERY_STATUSES.SENT
        )}

        {this.renderNotificationBox(
          notificationStats?.read || 0,
          totalCustomersCount,
          NOTIFICATION_DELIVERY_STATUSES.READ
        )}
        {this.renderNotificationBox(
          totalCustomersCount
            ? totalCustomersCount - (notificationStats?.read || 0)
            : 0,
          totalCustomersCount,
          NOTIFICATION_DELIVERY_STATUSES.UNREAD
        )}
      </React.Fragment>
    );
  }

  render() {
    const { message } = this.props;

    const actionBar = (
      <Wrapper.ActionBar left={<Title>{this.props.message.title}</Title>} />
    );

    const content = (
      <FlexContainer>
        {this.renderLeft()}
        <Half>
          <InfoWrapper>
            <p>
              Campaign has run: <strong>{message.runCount || 0} times</strong>
            </p>
            {message.lastRunAt ? (
              <p>
                Last run at:{" "}
                <strong>{dayjs(message.lastRunAt).format("lll")}</strong>
              </p>
            ) : null}
          </InfoWrapper>
          <RightSection>
            {this.renderEmailStats()}
            {this.renderSmsStats()}
            {this.renderNotificationsStats()}
            <EngageLogsContainer messageId={message._id} />
          </RightSection>
        </Half>
      </FlexContainer>
    );

    return (
      <Wrapper
        header={
          <Wrapper.Header
            title={__("Show statistics")}
            breadcrumb={[
              { title: __("Broadcast"), link: "/campaigns" },
              { title: __("Show statistics") },
            ]}
          />
        }
        actionBar={actionBar}
        content={content}
      />
    );
  }
}

export default EmailStatistics;
