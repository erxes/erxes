import { Alert, __ } from "coreui/utils";
import { FlexItem, FlexPad } from "@erxes/ui/src/components/step/styles";
import {
  MESSENGER_KINDS,
  SENT_AS_CHOICES,
} from "@erxes/ui-engage/src/constants";

import ControlLabel from "@erxes/ui/src/components/form/Label";
import FormControl from "@erxes/ui/src/components/form/Control";
import FormGroup from "@erxes/ui/src/components/form/Group";
import { IBrand } from "@erxes/ui/src/brands/types";
import { IEngageMessenger } from "@erxes/ui-engage/src/types";
import { IUser } from "@erxes/ui/src/auth/types";
import { MAIL_TOOLBARS_CONFIG } from "@erxes/ui/src/constants/integrations";
import MessengerPreview from "../containers/MessengerPreview";
import React from "react";
import RichTextEditor from "../containers/RichTextEditor";

type Props = {
  brands: IBrand[];
  onChange: (
    name: "messenger" | "content" | "fromUserId",
    value?: IEngageMessenger | string
  ) => void;
  users: IUser[];
  hasKind: boolean;
  messageKind: string;
  messenger: IEngageMessenger;
  fromUserId: string;
  content: string;
  isSaved?: boolean;
};

type State = {
  fromUserId: string;
  messenger: IEngageMessenger;
};

class MessengerForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      fromUserId: props.fromUserId,
      messenger: props.messenger,
    };
  }

  changeContent = (key, value) => {
    const messenger = {
      ...this.state.messenger,
    };

    messenger[key] = value;

    this.setState({ messenger });

    this.props.onChange("messenger", messenger);
  };

  changeFromUserId = (fromUserId) => {
    this.setState({ fromUserId });
    this.props.onChange("fromUserId", fromUserId);
  };

  renderKind(hasKind) {
    if (!hasKind) {
      return null;
    }

    const onChange = (e) =>
      this.changeContent("kind", (e.target as HTMLInputElement).value);

    return (
      <FormGroup>
        <ControlLabel>Message type:</ControlLabel>

        <FormControl
          componentclass="select"
          onChange={onChange}
          defaultValue={this.state.messenger.kind}
        >
          <option />{" "}
          {(MESSENGER_KINDS.SELECT_OPTIONS || []).map((k) => (
            <option key={k.value} value={k.value}>
              {k.text}
            </option>
          ))}
        </FormControl>
      </FormGroup>
    );
  }

  onEditorChange = (content: string) => {
    this.props.onChange("content", content);
  };

  render() {
    const onChangeFrom = (e) =>
      this.changeFromUserId((e.target as HTMLInputElement).value);

    const onChangeContent = (e) => {
      Alert.warning(
        "Please carefully select the brand, it will appear in the selected brand messenger."
      );
      this.changeContent("brandId", (e.target as HTMLInputElement).value);
    };

    const onChangeSentAs = (e) =>
      this.changeContent("sentAs", (e.target as HTMLInputElement).value);

    const { messenger, messageKind } = this.props;

    return (
      <FlexItem>
        <FlexPad overflow="auto" direction="column" count="3">
          <FormGroup>
            <ControlLabel>{__("Message:")}</ControlLabel>
            <RichTextEditor
              content={this.props.content}
              onChange={this.onEditorChange}
              toolbar={MAIL_TOOLBARS_CONFIG}
              height={300}
              name={`engage_${messageKind}_${messenger.brandId}`}
              isSubmitted={this.props.isSaved}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>From:</ControlLabel>
            <FormControl
              componentclass="select"
              onChange={onChangeFrom}
              value={this.state.fromUserId}
            >
              <option />{" "}
              {(this.props.users || []).map((user) => (
                <option key={user._id} value={user._id}>
                  {user.details ? user.details.fullName : user.username}
                </option>
              ))}
            </FormControl>
          </FormGroup>

          <FormGroup>
            <ControlLabel>Brand:</ControlLabel>
            <FormControl
              componentclass="select"
              onChange={onChangeContent}
              defaultValue={this.state.messenger.brandId}
            >
              <option />{" "}
              {(this.props.brands || []).map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </FormControl>
          </FormGroup>

          {this.renderKind(this.props.hasKind)}

          <FormGroup>
            <ControlLabel>{__("Sent as:")}</ControlLabel>
            <FormControl
              componentclass="select"
              onChange={onChangeSentAs}
              defaultValue={this.state.messenger.sentAs}
            >
              <option />{" "}
              {(SENT_AS_CHOICES.SELECT_OPTIONS || []).map((s) => (
                <option key={s.value} value={s.value}>
                  {__(s.text)}
                </option>
              ))}
            </FormControl>
          </FormGroup>
          {/* TODO enable after engage update */}
        </FlexPad>

        <FlexItem overflow="auto" count="2">
          <MessengerPreview
            sentAs={this.state.messenger.sentAs}
            content={this.props.content}
            fromUserId={this.state.fromUserId}
          />
        </FlexItem>
      </FlexItem>
    );
  }
}

export default MessengerForm;
