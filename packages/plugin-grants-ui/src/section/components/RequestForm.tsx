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
import { SelectActions } from '../../common/section/utils';
import { IGrantRequest } from '../../common/section/type';
import { generateExtraParams } from '../utils';
import { IUser } from '@erxes/ui/src/auth/types';
import { SmallLoader } from '@erxes/ui/src/components/ButtonMutate';
type Props = {
  cardType: string;
  cardId: string;
  object?: any;
  currentUser: IUser;
  request?: IGrantRequest;
  loading: boolean;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  cancelRequest: () => void;
};

type State = {
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
    const { currentUser, cardId, cardType } = this.props;
    const {
      request: { action, userIds, params }
    } = this.state;

    return {
      cardId,
      cardType,
      requesterId: currentUser._id,
      action,
      userIds,
      params: JSON.stringify(params)
    };
  }

  renderComponent() {
    const { cardType, cardId, object } = this.props;
    const { request } = this.state;

    if (!request?.action) {
      return null;
    }
    const handleSelect = (value, name, scope?) => {
      request[name] = value;
      request.scope = scope;

      this.setState({ request });
    };

    return loadDynamicComponent(
      'grantAction',
      {
        action: request.action,
        initialProps: {
          type: cardType,
          cardId,
          ...request?.params,
          ...generateExtraParams(request.scope, request.action, object)
        },
        onChange: params => handleSelect(params, 'params')
      },
      false,
      request?.scope
    );
  }

  renderContent(props: IFormProps) {
    const { request } = this.state;
    const { loading } = this.props;

    const handleSelect = (value, name, scope?) => {
      request[name] = value;
      request.scope = scope;

      this.setState({ request });
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
            onSelect={handleSelect}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Choos Action')}</ControlLabel>

          <SelectActions
            label="Choose Actions"
            name="action"
            initialValue={request.action}
            onSelect={handleSelect}
          />
        </FormGroup>
        {this.renderComponent()}
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
