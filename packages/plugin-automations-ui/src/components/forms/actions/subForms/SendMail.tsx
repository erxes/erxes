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
import React from 'react';
import { BackIcon } from '../../../../styles';
import { renderDynamicComponent } from '../../../../utils';
import PlaceHolderInput from '@erxes/ui-automations/src/components/forms/actions/placeHolder/PlaceHolderInput';
import Common from '@erxes/ui-automations/src/components/forms/actions/Common';

type Props = {
  activeAction: any;
  addAction: (action: IAction, actionId?: string, config?: any) => void;
  closeModal: () => void;
  triggerType: string;
  actionsConst: any[];
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
        {(config?.customMails || []).map(customMail => (
          <Chip
            key={customMail}
            onClick={removeMail.bind(this, customMail)}
            frontContent={<Avatar src="/images/avatar-colored.svg" />}
          >
            {customMail}
          </Chip>
        ))}
        <FormControl onKeyPress={onChange} placeholder="enter a some email" />
      </FormGroup>
    );
  }

  renderAttrubutionInput(customAttributions) {
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
          inputName="attributionMails"
          label="Attribution Mails"
          attrTypes={['user', 'contact']}
          onChange={onChange}
          customAttributions={customAttributions}
          additionalContent={
            <HelpPopover>
              <br>
                This type does not include (From Mail) and (Not Verified mails)
              </br>
            </HelpPopover>
          }
        />
      </>
    );
  }

  renderSegmentInput(key, onSelect) {
    const { config } = this.state;
    const { triggerType } = this.props;

    if (['contacts', 'user'].every(c => !triggerType.includes(c))) {
      return null;
    }

    return (
      <FormGroup>
        <ControlLabel>{__('Segment based mails')}</ControlLabel>
        <FormControl
          componentClass="checkbox"
          checked={config[key]}
          onClick={() => onSelect(!config[key], key)}
        />
      </FormGroup>
    );
  }

  renderRecipientTypeComponent(
    { serviceName, label, name, type, customAttributions },
    onSelect
  ) {
    const { config } = this.state;

    if (serviceName) {
      return renderDynamicComponent(
        {
          componentType: 'selectRecipients',
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
      case 'attributionMail':
        return this.renderAttrubutionInput(customAttributions);
      case 'segmentBased':
        return this.renderSegmentInput(type, onSelect);
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
                status: 'Verified'
              }}
            />
          </FormGroup>
        );
      default:
        return null;
    }
  }

  renderConfig(emailRecipientsConst) {
    const { config } = this.state;
    const { addAction, activeAction, closeModal, triggerType } = this.props;

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

    const onAddAction = () => {
      addAction(activeAction, activeAction.id, config);
      closeModal();
    };

    return (
      <Common
        closeModal={closeModal}
        addAction={onAddAction}
        activeAction={activeAction}
        config={config}
      >
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
            onChange={() => null}
            onKeyPress={onChange}
            triggerType={triggerType}
          />
          <FormGroup>
            <ControlLabel>{__('To Emails')}</ControlLabel>
            <DrawerDetail>
              {(emailRecipientsConst || []).map(emailRType =>
                this.renderRecipientTypeComponent(emailRType, onSelect)
              )}
            </DrawerDetail>
          </FormGroup>
        </DrawerDetail>
      </Common>
    );
  }

  renderAddTemplate() {
    const trigger = (
      <Button btnStyle="success" icon="plus-circle">
        {__('Add template')}
      </Button>
    );
    const content = ({ closeModal }) => {
      const updatedProps = {
        closeModal,
        params: { searchValue: this.state.searchValue }
      };

      return <AddTemplateForm {...updatedProps} />;
    };

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
    const { actionsConst } = this.props;
    const { emailRecipientsConst = [] } =
      actionsConst.find(action => action.type === 'sendEmail') || {};

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
      return this.renderConfig(emailRecipientsConst);
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
          selectedTemplateId={config?.templateId}
        />
      </>
    );
  }
}

export default SendMail;
