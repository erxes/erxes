import Button from 'modules/common/components/Button';
import {
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components/form';
import Icon from 'modules/common/components/Icon';
import { FlexItem, LeftItem } from 'modules/common/components/step/styles';
import Tip from 'modules/common/components/Tip';
import { __ } from 'modules/common/utils';
import { ITopic } from 'modules/knowledgeBase/types';
import { Options } from 'modules/settings/integrations/styles';
import {
  IIntegration,
  ILeadMessengerApp,
  IMessengerApps,
  ITopicMessengerApp,
  IWebsite,
  IWebsiteMessengerApp
} from 'modules/settings/integrations/types';
import React from 'react';
import Select from 'react-select-plus';
import styled from 'styled-components';

const WebsiteItem = styled.div`
  padding: 12px 16px 0 16px;
  background: #fafafa;
  border-radius: 4px;
  border: 1px solid #eee;
  position: relative;
`;

const RemoveButton = styled.div`
  position: absolute;
  right: 16px;
  top: 16px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: opacity ease 0.3s;

  &:hover {
    opacity: 0.8;
    cursor: pointer;
  }
`;

type Props = {
  type?: string;
  topics: ITopic[];
  leads: IIntegration[];
  selectedBrand?: string;
  leadMessengerApps?: ILeadMessengerApp[];
  knowledgeBaseMessengerApps?: ITopicMessengerApp[];
  websiteMessengerApps?: IWebsiteMessengerApp[];
  handleMessengerApps: (messengerApps: IMessengerApps) => void;
};

type State = {
  knowledgeBase: string;
  popups: string[];
  websites: IWebsite[];
};

class AddOns extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const {
      websiteMessengerApps = [],
      leadMessengerApps = [],
      knowledgeBaseMessengerApps = []
    } = props;

    const initialWebsites = websiteMessengerApps.map(item => ({
      url: item.credentials.url,
      buttonText: item.credentials.buttonText,
      description: item.credentials.description
    }));
    const initialLeads = leadMessengerApps.map(
      item => item.credentials.formCode
    );
    const initialKb =
      knowledgeBaseMessengerApps.length > 0 &&
      knowledgeBaseMessengerApps[0].credentials.topicId;

    this.state = {
      knowledgeBase: initialKb || '',
      popups: initialLeads || [],
      websites: initialWebsites || [
        { url: '', buttonText: '', description: '' }
      ]
    };
  }

  generateMessengerApps = () => {
    const { knowledgeBase, popups, websites } = this.state;
    return {
      knowledgebases: [{ topicId: knowledgeBase }],
      leads: popups.map(el => ({ formCode: el })),
      websites
    };
  };

  updateMessengerValues = () => {
    this.props.handleMessengerApps(this.generateMessengerApps());
  };

  renderOption = option => {
    return (
      <Options>
        {option.label}
        <i>{option.brand && option.brand.name}</i>
      </Options>
    );
  };

  generateObjectsParams = objects => {
    return objects.map(object => ({
      value: object.form ? object.form.code : object._id,
      label: object.name || object.title,
      brand: object.brand,
      disabled:
        object.brand && this.props.selectedBrand
          ? this.props.selectedBrand !== object.brand._id
          : false
    }));
  };

  onChangeKb = obj => {
    this.setState({ knowledgeBase: obj ? obj.value : '' }, () =>
      this.updateMessengerValues()
    );
  };

  onChangePopups = objects => {
    this.setState({ popups: objects.map(el => el.value) }, () =>
      this.updateMessengerValues()
    );
  };

  onChangeInput = (
    i: number,
    type: 'url' | 'description' | 'buttonText',
    e: React.FormEvent
  ) => {
    const { value } = e.target as HTMLInputElement;

    const entries = [...this.state.websites];

    entries[i] = { ...entries[i], [type]: value };

    this.setState({ websites: entries }, () => this.updateMessengerValues());
  };

  handleRemoveWebsite = (i: number) => {
    this.setState(
      { websites: this.state.websites.filter((item, index) => index !== i) },
      () => this.updateMessengerValues()
    );
  };

  renderRemoveInput = (i: number) => {
    return (
      <Tip text={__('Remove')} placement="top">
        <RemoveButton onClick={this.handleRemoveWebsite.bind(null, i)}>
          <Icon icon="times" />
        </RemoveButton>
      </Tip>
    );
  };

  onAddMoreInput = () => {
    this.setState({
      websites: [
        ...this.state.websites,
        { url: '', buttonText: '', description: '' }
      ]
    });
  };

  render() {
    const { knowledgeBase, popups, websites } = this.state;
    const { leads, topics } = this.props;

    return (
      <FlexItem>
        <LeftItem>
          <FormGroup>
            <ControlLabel>Knowledge Base</ControlLabel>
            <p>
              {__(
                'Which specific knowledgebase do you want to display in a separate tab in this messenger'
              )}
              ?
            </p>
            <Select
              value={knowledgeBase}
              options={this.generateObjectsParams(topics)}
              onChange={this.onChangeKb}
              optionRenderer={this.renderOption}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Forms</ControlLabel>
            <p>
              {__('Which form(s) do you want to display in this messenger')}?
            </p>
            <Select
              value={popups}
              options={this.generateObjectsParams(leads)}
              onChange={this.onChangePopups}
              optionRenderer={this.renderOption}
              multi={true}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Websites</ControlLabel>
            <p>
              {__('Which website(s) do you want to display in this messenger')}?
            </p>
          </FormGroup>
          {websites.map((website, index) => (
            <FormGroup key={index}>
              <WebsiteItem>
                <FormGroup>
                  <ControlLabel required={true}>Website Title</ControlLabel>
                  <FormControl
                    name="description"
                    onChange={this.onChangeInput.bind(
                      null,
                      index,
                      'description'
                    )}
                    required={true}
                    value={website.description}
                  />
                </FormGroup>
                <FormGroup>
                  <ControlLabel required={true}>Website Url</ControlLabel>
                  <FormControl
                    value={website.url}
                    onChange={this.onChangeInput.bind(null, index, 'url')}
                    name="url"
                    required={true}
                  />
                </FormGroup>
                <FormGroup>
                  <ControlLabel required={true}>Button text</ControlLabel>
                  <FormControl
                    onChange={this.onChangeInput.bind(
                      null,
                      index,
                      'buttonText'
                    )}
                    value={website.buttonText}
                    name="buttonText"
                    required={true}
                  />
                </FormGroup>
              </WebsiteItem>
              {this.renderRemoveInput(index)}
            </FormGroup>
          ))}
          <Button
            uppercase={false}
            onClick={this.onAddMoreInput}
            icon="plus-circle"
            btnStyle="primary"
          >
            {__('Add a Website')}
          </Button>
        </LeftItem>
      </FlexItem>
    );
  }
}

export default AddOns;
