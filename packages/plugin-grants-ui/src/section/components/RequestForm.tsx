import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React from 'react';
import {
  Button,
  Form as CommonForm,
  ControlLabel,
  FormGroup,
  SelectTeamMembers,
  __,
  loadDynamicComponent
} from '@erxes/ui/src';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { SelectActions, generateTeamMemberParams } from '../../common/utils';
import { IGrantRequest } from '../../common/type';
import { IUser } from '@erxes/ui/src/auth/types';
import { SmallLoader } from '@erxes/ui/src/components/ButtonMutate';
import CardActionComponent from '../../cards/ActionComponent';

type CheckConfigTypes = {
  contentType: string;
  contentTypeId: string;
  action: string;
  scope: string;
};

type Props = {
  contentType: string;
  contentTypeId: string;
  object?: any;
  currentUser: IUser;
  request?: IGrantRequest;
  loading: boolean;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  cancelRequest: () => void;
  checkConfig: (props: CheckConfigTypes) => boolean;
};

type State = {
  hasConfig: boolean;
  request: {
    action: string;
    userIds: string[];
    params: any;
    scope: string;
  };
};

class RequestForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      hasConfig: false,
      request: props.request || {
        scope: '',
        action: '',
        userIds: [],
        params: {}
      }
    };

    this.renderContent = this.renderContent.bind(this);
  }

  generateDocs() {
    const { contentTypeId, contentType } = this.props;
    const {
      request: { action, userIds, params, scope }
    } = this.state;

    return {
      contentTypeId,
      contentType,
      action,
      userIds,
      scope,
      params: JSON.stringify(params)
    };
  }

  renderComponent() {
    const { contentType, contentTypeId, object } = this.props;
    const { request } = this.state;

    if (!request?.action) {
      return null;
    }
    const handleSelect = (value, name) => {
      request[name] = value;

      this.setState({ request });
    };

    const updatedProps = {
      action: request.action,
      initialProps: {
        type: contentType,
        itemId: contentTypeId,
        ...request?.params
      },
      source: {
        ...object,
        type: contentType,
        pipelineId: object.pipeline?._id
      },
      onChange: params => handleSelect(params, 'params')
    };

    if (request?.scope === 'cards') {
      return <CardActionComponent {...updatedProps} />;
    }

    return loadDynamicComponent(
      'grantAction',
      {
        ...updatedProps
      },
      false,
      request?.scope
    );
  }

  renderContent(props: IFormProps) {
    const { request, hasConfig } = this.state;
    const { loading, object } = this.props;

    const handleSelect = (value, name, scope?) => {
      if (name === 'action') {
        request.params = {};
      }

      request[name] = value;
      if (scope) {
        request.scope = scope;
      }

      this.setState({ request });
    };

    const onChangeAction = async (value, name, scope?) => {
      const { contentType, contentTypeId, checkConfig } = this.props;

      handleSelect(value, name, scope);

      this.setState({
        hasConfig: await checkConfig({
          contentType,
          contentTypeId,
          action: value,
          scope
        })
      });
    };

    return (
      <>
        <FormGroup>
          <ControlLabel>{__('Select person who seeking grant')}</ControlLabel>
          <SelectTeamMembers
            label="Choose person who seeking grant"
            name="userIds"
            multi={true}
            initialValue={request.userIds}
            filterParams={generateTeamMemberParams(object)}
            onSelect={handleSelect}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Choos Action')}</ControlLabel>

          <SelectActions
            label="Choose Actions"
            name="action"
            initialValue={request.action}
            onSelect={onChangeAction}
          />
        </FormGroup>
        {!hasConfig && this.renderComponent()}
        <ModalFooter>
          <Button btnStyle="simple" disabled={loading}>
            {__('Close')}
          </Button>
          {!!Object.keys(this.props.request || {}).length && (
            <Button
              btnStyle="danger"
              onClick={this.props.cancelRequest}
              disabled={loading}
            >
              {loading && <SmallLoader />}
              {__('Cancel')}
            </Button>
          )}
          {this.props?.renderButton({
            name: 'grant',
            text: 'Grant Request',
            values: this.generateDocs(),
            isSubmitted: props.isSubmitted,
            object: !!Object.keys(this.props.request || {}).length
              ? request
              : null
          })}
        </ModalFooter>
      </>
    );
  }

  render() {
    return <CommonForm renderContent={this.renderContent} />;
  }
}

export default RequestForm;
