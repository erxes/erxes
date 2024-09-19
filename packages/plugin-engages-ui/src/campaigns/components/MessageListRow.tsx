import { Alert, __ } from "coreui/utils";
import { Disabled, HelperText, RowTitle } from "@erxes/ui-engage/src/styles";
import { IEngageMessage, IEngageMessenger } from "@erxes/ui-engage/src/types";
import {
  MESSAGE_KINDS,
  MESSAGE_KIND_FILTERS,
  METHODS
} from "@erxes/ui-engage/src/constants";

import ActionButtons from "@erxes/ui/src/components/ActionButtons";
import Button from "@erxes/ui/src/components/Button";
import { Capitalize } from "@erxes/ui-settings/src/permissions/styles";
import FormControl from "@erxes/ui/src/components/form/Control";
import { IBrand } from "@erxes/ui/src/brands/types";
import { ISegment } from "@erxes/ui-segments/src/types";
import Icon from "@erxes/ui/src/components/Icon";
import Label from "@erxes/ui/src/components/Label";
import NameCard from "@erxes/ui/src/components/nameCard/NameCard";
import React from "react";
import Tags from "@erxes/ui/src/components/Tags";
import Tip from "@erxes/ui/src/components/Tip";
import dayjs from "dayjs";
import { isEnabled } from "@erxes/ui/src/utils/core";
import s from "underscore.string";

type Props = {
  message: any;

  // TODO: add types
  edit: () => void;
  show: () => void;
  remove: () => void;
  setLive: () => void;
  setLiveManual: () => void;
  setPause: () => void;
  copy: () => void;

  isChecked: boolean;
  toggleBulk: (value: IEngageMessage, isChecked: boolean) => void;
};

class Row extends React.Component<Props> {
  renderLink(text: string, iconName: string, onClick, disabled?: boolean) {
    const button = <Button btnStyle="link" onClick={onClick} icon={iconName} />;

    return (
      <Tip
        text={__(text)}
        key={`${text}-${this.props.message._id}`}
        placement="top"
      >
        {disabled ? <Disabled>{button}</Disabled> : button}
      </Tip>
    );
  }

  onEdit = () => {
    const msg = this.props.message;

    if (msg.isLive && msg.kind != MESSAGE_KINDS.MANUAL) {
      return Alert.info("Pause the Campaign first and try editing");
    }

    if (msg.isLive && msg.kind === MESSAGE_KINDS.MANUAL) {
      return Alert.warning(
        "Unfortunately once a campaign has been sent, it cannot be stopped or edited."
      );
    }

    return this.props.edit();
  };

  renderStatus() {
    const { message } = this.props;
    const { kind, isLive, runCount, isDraft } = message;
    let labelStyle = "primary";
    let labelText = "Sending";

    if (isDraft === true) {
      return <Label lblStyle="simple">{__("Draft")}</Label>;
    }

    if (!isLive) {
      labelStyle = "simple";
      labelText = "Paused";
    } else {
      labelStyle = "primary";
      labelText = "Sending";
    }

    if (kind === MESSAGE_KINDS.MANUAL) {
      if (runCount > 0) {
        labelStyle = "success";
        labelText = "Sent";
      } else {
        labelStyle = "danger";
        labelText = "Not Sent";
      }
    }

    // scheduled auto campaign

    return <Label lblStyle={labelStyle}>{labelText}</Label>;
  }
  renderLinks() {
    const msg = this.props.message;

    const live = this.renderLink("Set live", "play-circle", this.props.setLive);
    const liveM = this.renderLink(
      "Set live",
      "play-circle",
      this.props.setLiveManual
    );
    const show = this.renderLink("Show statistics", "eye", this.props.show);
    const copy = this.renderLink("Duplicate", "copy-1", this.props.copy);
    const editLink = this.renderLink("Edit", "edit-3", this.onEdit, msg.isLive);

    const links: React.ReactNode[] = [];

    if ([METHODS.EMAIL, METHODS.SMS, METHODS.MESSENGER].includes(msg.method)) {
      links.push(editLink, copy);
    }

    if (
      [METHODS.EMAIL, METHODS.SMS, METHODS.NOTIFICATION].includes(msg.method) &&
      !msg.isDraft
    ) {
      links.push(show);
    }

    if (msg.kind === MESSAGE_KINDS.MANUAL) {
      if (msg.isDraft) {
        return [...links, liveM];
      }

      return links;
    }

    return [...links, live];
  }

  renderRemoveButton = onClick => {
    const { message } = this.props;
    const { runCount } = message;

    if (runCount > 0) {
      return null;
    }
    return (
      <Tip text={__("Delete")} placement="top">
        <Button btnStyle="link" onClick={onClick} icon="times-circle" />
      </Tip>
    );
  };

  toggleBulk = e => {
    this.props.toggleBulk(this.props.message, e.target.checked);
  };

  renderSegments(message) {
    let segments = message.segments || ([] as ISegment[]);

    segments = segments.filter(segment => segment && segment._id);

    return segments.map(segment => (
      <HelperText key={segment._id}>
        <Icon icon="chart-pie" /> {segment.name}
      </HelperText>
    ));
  }

  renderMessengerRules(message) {
    const messenger = message.messenger || ({} as IEngageMessenger);
    const rules = messenger.rules || [];

    return rules.map(rule => (
      <HelperText key={rule._id}>
        <Icon icon="sign-alt" /> {rule.text} {rule.condition} {rule.value}
      </HelperText>
    ));
  }

  renderBrands(message) {
    const brands = message.brands || ([] as IBrand[]);

    return brands.map(brand => (
      <HelperText key={brand._id}>
        <Icon icon="award" /> {brand.name}
      </HelperText>
    ));
  }

  onClick = () => {
    const { message } = this.props;

    if ([METHODS.EMAIL, METHODS.SMS].includes(message.method)) {
      return this.props.show();
    }

    if (message.kind !== MESSAGE_KINDS.MANUAL) {
      return this.props.edit();
    }
  };

  renderType(msg) {
    let icon: string = "multiply";
    let label: string = "Other type";
    switch (msg.method) {
      case METHODS.EMAIL:
        icon = "envelope";
        label = __("Email");

        break;
      case METHODS.SMS:
        icon = "comment-alt-message";
        label = __("Sms");

        break;
      case METHODS.MESSENGER:
        icon = "comment-1";
        label = __("Messenger");

        break;
      case METHODS.NOTIFICATION:
        icon = "message";
        label = __("Notification");

        break;
      default:
        break;
    }

    const kind = MESSAGE_KIND_FILTERS.find(item => item.name === msg.kind);

    return (
      <div>
        <Icon icon={icon} /> {label}
        <HelperText>
          <Icon icon="clipboard-notes" /> {kind && kind.text}
        </HelperText>
      </div>
    );
  }

  render() {
    const { isChecked, message, remove } = this.props;
    const { brand = { name: "" }, totalCustomersCount } = message;
    return (
      <tr key={message._id}>
        <td>
          <FormControl
            checked={isChecked}
            componentclass="checkbox"
            onChange={this.toggleBulk}
          />
        </td>
        <td>
          <RowTitle onClick={this.onClick}>{message.title}</RowTitle>
          {this.renderBrands(message)}
          {this.renderSegments(message)}
          {this.renderMessengerRules(message)}
        </td>
        <td>{this.renderStatus()}</td>
        <td className="text-primary">
          <Icon icon="cube-2" />
          <b> {s.numberFormat(totalCustomersCount || 0)}</b>
        </td>
        <td>{this.renderType(message)}</td>
        <td>
          <strong>{brand ? brand.name : "-"}</strong>
        </td>
        <td className="text-normal">
          <NameCard user={message.fromUser} avatarSize={30} />
        </td>

        <td className="text-normal">
          <Capitalize>{message.createdUserName || "-"}</Capitalize>
        </td>
        <td>
          <Icon icon="calender" />{" "}
          {dayjs(message.createdAt).format("DD MMM YYYY")}
        </td>

        <td>
          <Tags
            tags={[...(message.customerTags || []), ...(message.getTags || [])]}
          />
        </td>

        <td>
          <ActionButtons>
            {this.renderLinks()}
            {this.renderRemoveButton(remove)}
          </ActionButtons>
        </td>
      </tr>
    );
  }
}

export default Row;
