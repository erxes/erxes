import { FlexItem, LeftItem } from '@erxes/ui/src/components/step/styles';

import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { IMessages } from '../../../types';
import { IUser } from '@erxes/ui/src/auth/types';
import React from 'react';
import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import { SubHeading } from '@erxes/ui-settings/src/styles';
import { __ } from 'coreui/utils';
import { IExternalLink } from '@erxes/ui-inbox/src/settings/integrations/types';
import Button from '@erxes/ui/src/components/Button';
import { Alert } from '@erxes/ui/src/utils';
import Tip from '@erxes/ui/src/components/Tip';
import { Error } from '@erxes/ui/src/components/form/styles';
import styled from 'styled-components';

const LinkRemoverBtn = styled(Button)`
  margin-left: 10px;
`;

type Props = {
  onChange: (name: any, value: any) => void;
  teamMembers: IUser[];
  supporterIds: string[];
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  languageCode: string;
  messages: IMessages;
  externalLinks: IExternalLink[];
  onExternalLinksChange: (newExternalLinks: IExternalLink[]) => void;
};

type State = {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  languageCode?: string;
  messages: IMessages;
  errors: { [key: string]: React.ReactNode };
};

class Greeting extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { messages } = props;

    this.state = {
      facebook: '',
      instagram: '',
      twitter: '',
      youtube: '',
      messages,
      errors: {},
    };
  }

  //  This function validates a URL using the regex
  //  Source: Stack Overflow (https://stackoverflow.com/questions/8667070/javascript-regular-expression-to-validate-url)

  validateUrl = (value: string) => {
    const urlPattern =
      /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i;

    return urlPattern.test(value);
  };

  validateExternalLinks = () => {
    const { externalLinks } = this.props;
    const errors = externalLinks.reduce((acc, { url }) => {
      if (!this.validateUrl(url)) {
        acc[url] = <Error>Check the url and try again</Error>;
      }
      return acc;
    }, {});

    this.setState({ errors });
  };

  handleExternalLinkChange = (index: number) => (event) => {
    const { externalLinks } = this.props;
    const newExternalLinks = [...externalLinks];
    newExternalLinks[index].url = event.target.value;

    this.props.onExternalLinksChange(newExternalLinks);
    this.validateExternalLinks();
  };

  onInputChange = <T extends keyof State>(name: any, value: State[T]) => {
    this.setState({ [name]: value } as Pick<State, keyof State>);
    this.props.onChange(name, value);
  };

  onGreetingsChange = (name, value) => {
    const messages = { ...this.state.messages };

    messages[this.props.languageCode].greetings[name] = value;

    this.setState({ messages });

    this.props.onChange('messages', messages);
  };

  handleAddSocialLink = () => {
    const { externalLinks } = this.props;

    if (externalLinks.length >= 10) {
      Alert.warning('You can add up to 10 links');
      return;
    }

    this.props.onExternalLinksChange([...externalLinks, { url: '' }]);
  };
  handleOnRemove = (index: number) => (e) => {
    const { externalLinks } = this.props;
    const newExternalLinks = externalLinks.filter((_, idx) => idx !== index);
    const { [externalLinks[index].url]: removed, ...remainingErrors } =
      this.state.errors;

    this.props.onExternalLinksChange(newExternalLinks);
    this.setState({ errors: remainingErrors });
  };

  isAddLinkButtonDisabled = () => {
    if (this.props.externalLinks.length === 0) {
      return false;
    }

    const hasErrors = Object.keys(this.state.errors).length > 0;
    const hasValidLinks =
      this.props.externalLinks.length > 0 &&
      this.props.externalLinks.every((elink) => this.validateUrl(elink.url));

    return hasErrors || !hasValidLinks;
  };

  render() {
    const { languageCode, supporterIds } = this.props;
    const message = this.state.messages[languageCode] || {
      greetings: {
        title: '',
        message: '',
      },
    };

    const greetingTitle = (e) =>
      this.onGreetingsChange('title', (e.target as HTMLInputElement).value);

    const greetingMessage = (e) =>
      this.onGreetingsChange('message', (e.target as HTMLInputElement).value);

    const usersOnChange = (users) => this.props.onChange('supporterIds', users);

    const renderUrlLabel = (url: string) => {
      if (this.validateUrl(url)) {
        return (
          <img
            src={`https://www.google.com/s2/favicons?domain=${url}&sz=24`}
            alt="favicon"
          />
        );
      }
      return 'URL:';
    };

    return (
      <FlexItem>
        <LeftItem>
          <FormGroup>
            <ControlLabel>Greeting title</ControlLabel>

            <FormControl
              placeholder={__('Write here Greeting title') + '.'}
              rows={3}
              value={message.greetings.title}
              onChange={greetingTitle}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Greeting message</ControlLabel>

            <FormControl
              componentclass="textarea"
              placeholder={__('Write here Greeting message') + '.'}
              rows={3}
              value={message.greetings.message}
              onChange={greetingMessage}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>Supporters</ControlLabel>

            <SelectTeamMembers
              label="Choose users"
              name="supporterIds"
              initialValue={supporterIds}
              onSelect={usersOnChange}
            />
          </FormGroup>

          <SubHeading>{__('Links')}</SubHeading>

          {this.props.externalLinks.map((externalLink, idx) => (
            <FormGroup key={idx} horizontal>
              <ControlLabel required>
                {renderUrlLabel(externalLink.url)}
              </ControlLabel>
              <FormControl
                rows={3}
                placeholder="Enter a URL"
                value={externalLink.url}
                onChange={this.handleExternalLinkChange(idx)}
                name={externalLink.url}
                errors={this.state.errors}
                autoFocus={idx === this.props.externalLinks.length - 1}
              />
              <Tip text={__('Remove')} placement="left-end">
                <LinkRemoverBtn
                  btnStyle="danger"
                  size="small"
                  icon="trash"
                  onClick={this.handleOnRemove(idx)}
                />
              </Tip>
            </FormGroup>
          ))}

          <Button
            onClick={this.handleAddSocialLink}
            icon="plus-circle"
            btnStyle="primary"
            disabled={this.isAddLinkButtonDisabled()}
          >
            Add social link
          </Button>
        </LeftItem>
      </FlexItem>
    );
  }
}

export default Greeting;
