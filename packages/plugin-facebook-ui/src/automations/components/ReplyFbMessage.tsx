import SelectTeamMembers from '@erxes/ui/src/team/containers/SelectTeamMembers';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormGroup from '@erxes/ui/src/components/form/Group';
import Common from '@erxes/ui-automations/src/components/forms/actions/Common';
import PlaceHolderInput from '@erxes/ui-automations/src/components/forms/actions/placeHolder/PlaceHolderInput';
import { DrawerDetail } from '@erxes/ui-automations/src/styles';
import { IAction } from '@erxes/ui-automations/src/types';
import React from 'react';
import {
  __,
  Button,
  FormControl,
  Icon,
  ModifiableList,
  Uploader
} from '@erxes/ui/src';
import { Tabs, TabTitle } from '@erxes/ui/src/components/tabs';
import { LinkButton } from '@erxes/ui/src/styles/main';

type Props = {
  onSave: () => void;
  closeModal: () => void;
  activeAction: IAction;
  addAction: (action: IAction, actionId?: string, config?: any) => void;
  triggerType: string;
};

type State = {
  config: any;
  selectedTab: string;
  selectedTemplatePageId?: string;
};

const tableConst = [
  {
    label: 'Text',
    value: 'text'
  },
  {
    label: 'Message Template',
    value: 'messageTemplate'
  },
  {
    label: 'Quick Replies',
    value: 'quickReplies'
  }
];

const getSelectedTab = config => {
  if (config?.text) {
    return 'text';
  }

  if (config?.messageTemplate) {
    return 'messageTemplate';
  }

  if (config?.quickReplies) {
    return 'quickReplies';
  }

  return localStorage.getItem('fb_selected_message_action_tab') || '';
};

const generateSelectedPageId = config => {
  const messageTemplates = config?.messageTemplates || [];

  return messageTemplates[0]?._id || '';
};

class ReplyFbMessage extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      config: props?.activeAction?.config || null,
      selectedTab: getSelectedTab(props?.activeAction?.config),
      selectedTemplatePageId: generateSelectedPageId(
        props?.activeAction?.config
      )
    };
  }

  renderTemplateContent(_id, template, config, messageTemplates: any[]) {
    const onChange = (name, value) => {
      const updatedTemplates = messageTemplates.map(temp =>
        temp._id === _id ? { ...temp, [name]: value } : temp
      );

      this.setState({
        config: { ...config, messageTemplates: updatedTemplates }
      });
    };

    const handleChange = e => {
      const { name, value } = e.currentTarget as HTMLInputElement;
      onChange(name, value);
    };

    const handleUpload = value => {
      if (value.length > 0) {
        const image = value[0];
        return onChange('image', image);
      }
      onChange('image', null);
    };

    return (
      <>
        {messageTemplates?.length > 1 && (
          <Uploader
            single
            text="Upload Image"
            onChange={handleUpload}
            defaultFileList={template?.image ? [template?.image] : []}
          />
        )}
        <FormGroup>
          <ControlLabel>{__('Title')}</ControlLabel>
          <FormControl
            name="title"
            onChange={handleChange}
            value={template?.title}
          />
        </FormGroup>
        {messageTemplates?.length > 1 && (
          <FormGroup>
            <ControlLabel>{__('Description')}</ControlLabel>
            <FormControl
              name="description"
              componentClass="textarea"
              value={template?.description}
              onChange={handleChange}
            />
          </FormGroup>
        )}
        <ModifiableList
          options={template?.buttons || []}
          addButtonLabel="Add Buttons"
          showAddButton
          onChangeOption={buttons => onChange('buttons', buttons)}
        />
      </>
    );
  }

  renderTemplates(config) {
    const { selectedTemplatePageId } = this.state;
    const messageTemplates = config?.messageTemplates || [];

    const selectedTemplatePage = messageTemplates.find(
      tepmplate => tepmplate._id === selectedTemplatePageId
    );

    const addPage = () => {
      const updatedConfig = {
        ...config,
        messageTemplates: [
          ...messageTemplates,
          {
            _id: Math.random(),
            label: `Page ${(messageTemplates?.length || 0) + 1}`
          }
        ]
      };

      this.setState({ config: updatedConfig });
    };

    const onSelectTab = value => {
      this.setState({ selectedTemplatePageId: value });
    };

    return (
      <>
        <Tabs>
          {messageTemplates.map(({ _id, label }) => (
            <TabTitle
              key={_id}
              className={_id === selectedTemplatePageId ? 'active' : ''}
              onClick={onSelectTab.bind(this, _id)}
            >
              {__(label)}
            </TabTitle>
          ))}

          <Button btnStyle="link" icon="focus-add" onClick={addPage} />
        </Tabs>
        {selectedTemplatePage &&
          this.renderTemplateContent(
            selectedTemplatePageId,
            selectedTemplatePage,
            config,
            messageTemplates
          )}
      </>
    );
  }

  renderQuickReplies(config) {
    const quickReplies = config?.quickReplies || [];

    const onChange = options => {
      const uniqueOptions = options
        .filter(
          option =>
            !quickReplies.find(quickReply => quickReply.label === option)
        )
        .map(opt => ({ _id: Math.random(), label: opt }));

      this.setState({
        config: {
          ...config,
          quickReplies: [...quickReplies, ...uniqueOptions]
        }
      });
    };

    return (
      <ModifiableList
        options={quickReplies.map(quickReply => quickReply?.label || '') || []}
        onChangeOption={onChange}
      />
    );
  }

  renderContent(selectedTab) {
    const { config } = this.state;
    const { triggerType } = this.props;

    if (selectedTab === 'text') {
      return (
        <PlaceHolderInput
          config={config}
          triggerType={triggerType}
          inputName="text"
          label="Reply Text"
          onChange={config => this.setState({ config })}
        />
      );
    }

    if (selectedTab === 'messageTemplate') {
      return this.renderTemplates(config);
    }

    if (selectedTab === 'quickReplies') {
      return this.renderQuickReplies(config);
    }

    return null;
  }

  renderTabs() {
    const { selectedTab } = this.state;

    const onSelectTab = value => {
      console.log({ value });
      const { text, quickReplies, messageTemplates, ...config } =
        this.state.config || {};

      localStorage.setItem('fb_selected_message_action_tab', value);
      this.setState({ selectedTab: value, config });
    };

    return (
      <>
        <Tabs full>
          {tableConst.map(({ value, label }) => (
            <TabTitle
              className={selectedTab === value ? 'active' : ''}
              onClick={onSelectTab.bind(this, value)}
            >
              {__(label)}
            </TabTitle>
          ))}
        </Tabs>
        {this.renderContent(selectedTab)}
      </>
    );
  }

  render() {
    const { activeAction, closeModal, addAction } = this.props;
    const { config } = this.state;

    return (
      <DrawerDetail>
        <Common
          closeModal={closeModal}
          addAction={addAction}
          activeAction={activeAction}
          config={config}
        >
          <FormGroup>
            <ControlLabel>{'From'}</ControlLabel>
            <SelectTeamMembers
              name="fromUserId"
              initialValue={config?.fromUserId}
              label="Select from user"
              onSelect={value =>
                this.setState({ config: { ...config, fromUserId: value } })
              }
              filterParams={{
                status: 'Verified'
              }}
              multi={false}
            />
          </FormGroup>
          {this.renderTabs()}
        </Common>
      </DrawerDetail>
    );
  }
}

export default ReplyFbMessage;
