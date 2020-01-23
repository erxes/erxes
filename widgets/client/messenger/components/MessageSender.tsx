import * as React from "react";
import { iconAttach } from "../../icons/Icons";

type Props = {
  placeholder?: string;
  conversationId: string | null;
  isAttachingFile: boolean;
  isParentFocused: boolean;
  sendMessage: (message: string) => void;
  sendTypingInfo: (conversationId: string, text: string) => void;
  sendFile: (file: File) => void;
  readMessages: (conversationId: string) => void;
  onTextInputBlur: () => void;
  collapseHead: () => void;
};

type State = {
  message: string;
};

let inputTimeoutInstance: any;

class MessageSender extends React.Component<Props, State> {
  private textarea: any;
  private form: any;

  constructor(props: Props) {
    super(props);

    this.state = { message: "" };

    this.onSubmit = this.onSubmit.bind(this);
    this.handleMessageChange = this.handleMessageChange.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleFileInput = this.handleFileInput.bind(this);
    this.handleOnBlur = this.handleOnBlur.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  readMessages = () => {
    if (this.props.conversationId) {
      this.props.readMessages(this.props.conversationId);
    }
  };

  componentDidMount() {
    if (this.textarea && window.innerWidth > 415) {
      this.textarea.focus();
    }
  }

  componentDidUpdate(nextProps: Props) {
    if (nextProps.isParentFocused) {
      if (this.textarea) {
        this.textarea.focus();
      }
    }
  }

  setHeight(height?: number) {
    const textarea = this.textarea;
    const form = this.form;
    // for reset element's scrollHeight
    textarea.style.height = 0;

    if (height) {
      return (form.style.height = textarea.style.height = `${height}px`);
    }

    form.style.height = textarea.style.height = `${textarea.scrollHeight}px`;
  }

  setArea = (textarea: HTMLTextAreaElement) => {
    this.textarea = textarea;
  };

  setForm = (form: HTMLFormElement) => {
    this.form = form;
  };

  sendMessage() {
    this.clearTimeout();
    this.props.sendMessage(this.state.message);
    this.setState({ message: "" });
    this.setHeight(60);
  }

  onSubmit(e: React.FormEvent) {
    e.preventDefault();
    this.sendMessage();
  }

  clearTimeout() {
    if (inputTimeoutInstance) {
      clearTimeout(inputTimeoutInstance);
    }
  }

  handleMessageChange(e: React.FormEvent<HTMLTextAreaElement>) {
    const { sendTypingInfo, conversationId } = this.props;
    const message = e.currentTarget.value;

    this.setState({ message });

    if (conversationId) {
      this.clearTimeout();

      inputTimeoutInstance = setTimeout(() => {
        sendTypingInfo(conversationId, message);
      }, 800);
    }

    this.setHeight();
  }

  componentWillUnmount() {
    this.clearTimeout();
  }

  handleOnBlur() {
    const { onTextInputBlur, sendTypingInfo, conversationId } = this.props;

    if (conversationId) {
      sendTypingInfo(conversationId, "");
    }

    onTextInputBlur();
  }

  handleClick() {
    this.props.collapseHead();
  }

  handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      this.sendMessage();
    }
  }

  handleFileInput(e: React.FormEvent<HTMLInputElement>) {
    e.preventDefault();

    const files = e.currentTarget.files;

    if (files && files.length > 0) {
      this.props.sendFile(files[0]);
    }
  }

  render() {
    return (
      <form
        className="erxes-message-sender"
        ref={this.setForm}
        onSubmit={this.onSubmit}
      >
        <textarea
          ref={this.setArea}
          className="reply"
          placeholder={this.props.placeholder}
          value={this.state.message}
          onChange={this.handleMessageChange}
          onFocus={this.readMessages}
          onBlur={this.handleOnBlur}
          onClick={this.handleClick}
          onKeyDown={this.handleKeyPress}
        />
        {this.props.isAttachingFile ? (
          <div className="loader" />
        ) : (
          <label htmlFor="file-upload" className="btn-attach">
            {iconAttach}
            <input
              id="file-upload"
              type="file"
              onChange={this.handleFileInput}
            />
          </label>
        )}
      </form>
    );
  }
}

export default MessageSender;
