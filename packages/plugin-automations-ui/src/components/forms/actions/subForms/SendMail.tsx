import React from 'react';
import {
  BarItems,
  Button,
  ControlLabel,
  EmptyState,
  FormControl,
  FormGroup,
  Icon,
  ModalTrigger,
  SelectTeamMembers,
  Spinner,
  __,
  withProps
} from '@erxes/ui/src';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import * as compose from 'lodash.flowright';
import { QueryResponse } from '@erxes/ui/src/types';
import { TemplateWrapper } from '../styles';
import dayjs from 'dayjs';
import { DrawerDetail } from '@erxes/ui-automations/src/styles';
import { BackIcon } from '../../../../styles';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import Select from 'react-select-plus';
import { USER_TYPES } from '../constants';
import { IAction } from '@erxes/ui-automations/src/types';

type EmailTemplatesProps = {
  searchValue: string;
  handleSelect: (id: string) => void;
  templateId?: string;
};

type FinalEmailTemplatesProps = {
  emailTemplatesQuery: { emailTemplates: any[] } & QueryResponse;
} & EmailTemplatesProps;

const emailTemplatesQuery = `
  query emailTemplates($page: Int, $perPage: Int, $searchValue: String) {
    emailTemplates(page: $page, perPage: $perPage, searchValue: $searchValue) {
      _id
      name
      content
      createdAt
      status
      modifiedAt
      createdUser {
        _id
        username
        details {
          fullName
          avatar
        }
      }
    }
  }
`;

class EmailTemplatesComponent extends React.Component<
  FinalEmailTemplatesProps
> {
  constructor(props) {
    super(props);
  }

  renderDate(createdAt, modifiedAt) {
    if (createdAt === modifiedAt) {
      if (createdAt === null) return '-';

      return dayjs(createdAt).format('DD MMM YYYY');
    }

    return dayjs(modifiedAt).format('DD MMM YYYY');
  }

  renderView(content) {
    const trigger = (
      <div>
        <Icon icon="eye" /> View
      </div>
    );
    const form = () => {
      return (
        <TemplateWrapper.IframePreview height="800px">
          <iframe title="content-iframe" srcDoc={content} />
        </TemplateWrapper.IframePreview>
      );
    };

    return (
      <ModalTrigger
        content={form}
        trigger={trigger}
        hideHeader
        title=""
        size="lg"
      />
    );
  }

  renderTemplate({ _id, name, createdAt, modifiedAt, createdUser, content }) {
    const { templateId } = this.props;
    console.log({ templateId, dsad: 'dasdsdas' });
    return (
      <TemplateWrapper.Template
        key={_id}
        className={templateId === _id ? 'active' : ''}
      >
        <h5>{name}</h5>
        <TemplateWrapper.TemplateBox>
          <TemplateWrapper.Actions>
            {this.renderView(content)}
            <div onClick={this.props.handleSelect.bind(this, _id)}>
              <Icon icon="clicker" /> Select
            </div>
          </TemplateWrapper.Actions>
          <TemplateWrapper.IframePreview pointerEvent="none" width="200%">
            <iframe title="content-iframe" srcDoc={content} />
          </TemplateWrapper.IframePreview>
        </TemplateWrapper.TemplateBox>
        <TemplateWrapper.TemplateInfo>
          <p>{createdAt === modifiedAt ? `Created at` : `Modified at`}</p>
          <p>{this.renderDate(createdAt, modifiedAt)}</p>
        </TemplateWrapper.TemplateInfo>
        <TemplateWrapper.TemplateInfo>
          <p>Created by</p>
          {createdUser ? (
            createdUser.details.fullName && (
              <p>{createdUser.details.fullName}</p>
            )
          ) : (
            <p>erxes Inc</p>
          )}
        </TemplateWrapper.TemplateInfo>
      </TemplateWrapper.Template>
    );
  }

  render() {
    const { emailTemplatesQuery } = this.props;
    const { emailTemplates, loading } = emailTemplatesQuery;

    if (loading) {
      return <Spinner />;
    }

    if (!emailTemplates?.length) {
      return (
        <EmptyState
          size="small"
          text="Not Found"
          image="/images/actions/5.svg"
        />
      );
    }

    return (
      <>
        {emailTemplates.map(emailTemplate =>
          this.renderTemplate(emailTemplate)
        )}
      </>
    );
  }
}

const SelectEmailTemplates = withProps<EmailTemplatesProps>(
  compose(
    graphql<EmailTemplatesProps>(gql(emailTemplatesQuery), {
      name: 'emailTemplatesQuery',
      options: ({ searchValue }) => ({
        variables: { searchValue }
      })
    })
  )(EmailTemplatesComponent)
);

type Props = {
  action: any;
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
      config: props?.action?.config || null
    };
  }

  selectedUserTypeComponent(type, onSelect) {
    if (!type) {
      return null;
    }

    const { component, name, label } = USER_TYPES.find(
      uType => uType.value === type
    ) as any;

    const Component = component;

    return (
      <FormGroup>
        <ControlLabel>{__(label)}</ControlLabel>
        <Component name={`${name}Ids`} label={label} onSelect={onSelect} />
      </FormGroup>
    );
  }

  renderConfig() {
    const { config } = this.state;
    const { addAction, action, closeModal } = this.props;

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
      addAction(action, action.id, config);
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
          <ControlLabel>{__('User types')}</ControlLabel>
          <Select
            options={USER_TYPES}
            name="userType"
            value={config?.userType}
            onChange={e => onSelect(e.value, 'userType')}
          />
        </FormGroup>
        {this.selectedUserTypeComponent(config.userType, onSelect)}
        <ModalFooter>
          <Button btnStyle="success" onClick={onAddAction}>
            {__('Save')}
          </Button>
        </ModalFooter>
      </DrawerDetail>
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

    console.log(config?.templateId);

    if (config?.templateId) {
      return this.renderConfig();
    }

    return (
      <>
        <FormGroup>
          <ControlLabel>{__('Type a search')}</ControlLabel>
          <BarItems>
            <FormControl
              name="searchValue"
              value={searchValue}
              onChange={onSearch}
            />
            <Button btnStyle="success">{__('Add')}</Button>
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
