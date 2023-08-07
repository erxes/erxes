import React from 'react';
import {
  BarItems,
  Button,
  Chip,
  ControlLabel,
  EmptyState,
  FormControl,
  FormGroup,
  Icon,
  ModalTrigger,
  SelectTeamMembers,
  Spinner,
  __,
  colors,
  withProps
} from '@erxes/ui/src';
import { DrawerDetail } from '@erxes/ui-automations/src/styles';
import { BackIcon } from '../../../../styles';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import Select from 'react-select-plus';
import { RECIPIENT_TYPES } from '../constants';
import { IAction } from '@erxes/ui-automations/src/types';
import { Avatar } from '@erxes/ui/src/components/SelectWithSearch';
import SelectEmailTemplates from '@erxes/ui-emailtemplates/src/containers/SelectEmailtTemplate';
import AddTemplateForm from '@erxes/ui-emailtemplates/src/containers/Form';

type Props = {
  activeAction: any;
  addAction: (action: IAction, actionId?: string, config?: any) => void;
  closeModal: () => void;
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

  renderRecipientTypeComponent(type, onSelect) {
    if (!type) {
      return null;
    }

    const { component, value, label, name } = RECIPIENT_TYPES.find(
      rType => rType.value === type
    ) as any;

    if (value === 'customMail') {
      return this.renderCustomMailInput();
    }

    const Component = component;

    return (
      <FormGroup>
        <ControlLabel>{__(label)}</ControlLabel>
        <Component name={name} label={label} onSelect={onSelect} />
      </FormGroup>
    );
  }

  renderConfig() {
    const { config } = this.state;
    const { addAction, activeAction, closeModal } = this.props;

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

    const onChangeReciepentType = (value, name) => {
      const keys = RECIPIENT_TYPES.filter(rType => rType.value !== value).map(
        rType => rType.name
      );

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
            multi={false}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>{'Sender'}</ControlLabel>
          <FormControl
            name="sender"
            defaultValue={config?.sender}
            onChange={onChange}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>{'Email Subject'}</ControlLabel>
          <FormControl
            name="subject"
            defaultValue={config?.subject}
            onChange={onChange}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Recipient types')}</ControlLabel>
          <Select
            options={RECIPIENT_TYPES}
            name="recipientType"
            value={config?.recipientType}
            onChange={e => onChangeReciepentType(e.value, 'recipientType')}
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
