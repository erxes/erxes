import { DrawerDetail } from '@erxes/ui-automations/src/styles';
import { IAction } from '@erxes/ui-automations/src/types';
import AddTemplateForm from '@erxes/ui-emailtemplates/src/containers/Form';
import SelectEmailTemplates from '@erxes/ui-emailtemplates/src/containers/SelectEmailtTemplate';
import {
  BarItems,
  Button,
  Chip,
  ControlLabel,
  FormControl,
  FormGroup,
  HelpPopover,
  Icon,
  ModalTrigger,
  SelectTeamMembers,
  __
} from '@erxes/ui/src';
import { Avatar } from '@erxes/ui/src/components/SelectWithSearch';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import React from 'react';
import Select from 'react-select-plus';
import { BackIcon } from '../../../../styles';
import { renderDynamicComponent } from '../../../../utils';
import PlaceHolderInput from '@erxes/ui-automations/src/components/forms/actions/placeHolder/PlaceHolderInput';
import { StepImg } from '@erxes/ui/src/components/step/styles';

type Props = {
  activeAction: any;
  addAction: (action: IAction, actionId?: string, config?: any) => void;
  closeModal: () => void;
  emailRecipientsConst: any[];
  triggerType: string;
};

type State = {
  searchValue: string;
  config?: any;
};

class SendMail extends React.Component<Props, State> {
  private timer?: NodeJS.Timer;
  constructor(props) {
    super(props);

    this.state = {
      searchValue: '',
      config: props?.activeAction?.config || null
    };
  }

  renderCustomMailInput() {
    const { config } = this.state;
    const onChange = e => {
      const { value } = e.currentTarget as HTMLInputElement;
      if (
        e.key === 'Enter' &&
        value.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ) {
        this.setState({
          config: {
            ...config,
            customMails: (config?.customMails || []).concat(value)
          }
        });
        e.currentTarget.value = '';
      }
    };

    const removeMail = mail => {
      this.setState({
        config: {
          ...config,
          customMails: (config?.customMails || []).filter(
            value => value !== mail
          )
        }
      });
    };

    return (
      <FormGroup>
        <ControlLabel>{__('Custom Mail')}</ControlLabel>
        <DrawerDetail>
          {(config?.customMails || []).map(customMail => (
            <Chip
              key={customMail}
              onClick={removeMail.bind(this, customMail)}
              frontContent={<Avatar src="/images/avatar-colored.svg" />}
            >
              {customMail}
            </Chip>
          ))}
          <FormControl onKeyPress={onChange} />
        </DrawerDetail>
      </FormGroup>
    );
  }

  renderAttrubutionInput() {
    const { triggerType } = this.props;
    const { config } = this.state;

    const onChange = updatedConfig => {
      this.setState({
        config: updatedConfig
      });
    };

    return (
      <>
        <PlaceHolderInput
          config={config}
          triggerType={triggerType}
          inputName="triggerAttributionMails"
          label="Trigger Attribution Mails"
          attrType="user"
          onChange={onChange}
          additionalContent={
            <HelpPopover>
              This type does not include (From Mail) and (Not Verified mails)
            </HelpPopover>
          }
        />
      </>
    );
  }

  renderRecipientTypeComponent(type, onSelect) {
    if (!type) {
      return null;
    }

    const { config } = this.state;
    const { emailRecipientsConst } = this.props;
    const { serviceName, label, name } =
      (emailRecipientsConst.find(rType => rType.type === type) as any) || {};

    if (serviceName) {
      return renderDynamicComponent(
        {
          componentType: 'selectReciepents',
          type,
          value: config[name],
          label,
          name,
          onSelect
        },
        `${serviceName}:${type}`
      );
    }

    switch (type) {
      case 'customMail':
        return this.renderCustomMailInput();
      case 'triggerAttributionMails':
        return this.renderAttrubutionInput();
      case 'teamMember':
        return (
          <FormGroup>
            <ControlLabel>{__(label)}</ControlLabel>
            <SelectTeamMembers
              name={name}
              initialValue={config[name]}
              label={label}
              onSelect={onSelect}
              filterParams={{
                excludeIds: true,
                ids: [config.fromUserId],
                status: 'Verified'
              }}
            />
          </FormGroup>
        );
      default:
        return null;
    }
  }

  renderConfig() {
    const { config } = this.state;
    const {
      addAction,
      activeAction,
      closeModal,
      emailRecipientsConst,
      triggerType
    } = this.props;

    const onBackAction = () => {
      this.setState({ config: null });
    };

    const onSelect = (value, name) => {
      this.setState({ config: { ...config, [name]: value } });
    };

    const onChange = e => {
      const { value, name } = e.currentTarget as HTMLInputElement;

      this.setState({ config: { ...config, [name]: value } });
    };

    const onChangeConfig = rConf => {};

    const onChangeReciepentType = (value, name) => {
      const keys = emailRecipientsConst
        .filter(rType => rType.type !== value)
        .map(rType => rType.name);

      const updatedConfig = Object.fromEntries(
        Object.entries(config).filter(([key]) => !!keys.includes(key))
      );
      this.setState({ config: updatedConfig });
      onSelect(value, name);
    };

    const onAddAction = () => {
      addAction(activeAction, activeAction.id, config);
      closeModal();
    };

    return (
      <DrawerDetail>
        <BackIcon onClick={onBackAction}>
          <Icon icon="angle-left" size={20} /> {__('Back')}
        </BackIcon>
        <FormGroup>
          <ControlLabel>{'From'}</ControlLabel>
          <SelectTeamMembers
            name="fromUserId"
            initialValue={config?.fromUserId}
            label="Select from user"
            onSelect={onSelect}
            filterParams={{
              status: 'Verified'
            }}
            multi={false}
          />
        </FormGroup>

        <PlaceHolderInput
          inputName="subject"
          label="Email Subject"
          config={config}
          onChange={onChangeConfig}
          onKeyPress={onChange}
          triggerType={triggerType}
        />
        <FormGroup>
          <ControlLabel>{__('Recipient types')}</ControlLabel>
          <Select
            options={(emailRecipientsConst || []).map(eR => ({
              value: eR.type,
              label: eR.label
            }))}
            name="recipientType"
            value={config?.recipientType}
            onChange={e =>
              onChangeReciepentType(e?.value || '', 'recipientType')
            }
          />
        </FormGroup>
        {this.renderRecipientTypeComponent(config.recipientType, onSelect)}
        <ModalFooter>
          <Button btnStyle="success" onClick={onAddAction}>
            {__('Save')}
          </Button>
        </ModalFooter>
      </DrawerDetail>
    );
  }

  renderAddTemplate() {
    const trigger = (
      <Button btnStyle="success" icon="plus-circle">
        {__('Add new email template')}
      </Button>
    );
    const content = props => <AddTemplateForm {...props} />;

    return (
      <ModalTrigger
        title="Add New "
        content={content}
        trigger={trigger}
        size="lg"
      />
    );
  }

  render() {
    const { searchValue, config } = this.state;

    const onSearch = e => {
      if (this.timer) {
        clearTimeout(this.timer);
      }

      const searchValue = e.target.value;

      this.setState({ searchValue });
    };

    const selectTemplate = id => {
      this.setState({ config: { ...config, templateId: id } });
    };

    if (config?.templateId) {
      return this.renderConfig();
    }

    return (
      <>
        <FormGroup>
          <ControlLabel>{__('Search')}</ControlLabel>
          <BarItems>
            <FormControl
              name="searchValue"
              placeholder="type a search"
              value={searchValue}
              onChange={onSearch}
            />
            {this.renderAddTemplate()}
          </BarItems>
        </FormGroup>
        <SelectEmailTemplates
          searchValue={searchValue}
          handleSelect={selectTemplate}
          templateId={config?.templateId}
        />
      </>
    );
  }
}

export default SendMail;
