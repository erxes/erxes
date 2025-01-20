import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React, { useState } from 'react';
import {
  Button,
  Form as CommonForm,
  ControlLabel,
  FormGroup,
  SelectTeamMembers,
  __,
  loadDynamicComponent,
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
  checkConfig: (props: CheckConfigTypes) => Promise<boolean>;
};

const RequestForm: React.FC<Props> = (props) => {
  const [state, setState] = useState({
    hasConfig: false,
    request: props.request || {
      scope: '',
      action: '',
      userIds: [],
      params: {} as any,
    },
  });
  const { contentTypeId, contentType, object, loading, checkConfig } = props;

  const generateDocs = () => {
    const {
      request: { action, userIds, params, scope },
    } = state;

    return {
      contentTypeId,
      contentType,
      action,
      userIds,
      scope,
      params: JSON.stringify(params),
    };
  };

  const renderComponent = () => {
    const { request } = state;

    if (!request?.action) {
      return null;
    }
    const handleSelect = (value, name) => {
      request[name] = value;

      setState((prevState) => ({ ...prevState, request }));
    };

    const updatedProps = {
      action: request.action,
      initialProps: {
        type: contentType,
        itemId: contentTypeId,
        ...request?.params,
      },
      source: {
        ...object,
        type: contentType,
        pipelineId: object.pipeline?._id,
      },
      onChange: (params) => handleSelect(params, 'params'),
    };

    if (request?.scope === 'cards') {
      return <CardActionComponent {...updatedProps} />;
    }

    return loadDynamicComponent(
      'grantAction',
      {
        ...updatedProps,
      },
      false,
      request?.scope,
    );
  };

  const renderContent = (formProps: IFormProps) => {
    const { request, hasConfig } = state;

    const handleSelect = (value, name, scope?) => {
      if (name === 'action') {
        request.params = {};
      }

      request[name] = value;
      if (scope) {
        request.scope = scope;
      }

      setState((prevState) => ({ ...prevState, request }));
    };

    const onChangeAction = async (value, name, scope?) => {
      handleSelect(value, name, scope);

      const hasConfig = await checkConfig({
          contentType,
          contentTypeId,
          action: value,
          scope,
        })

      setState((prevState) => ({
        ...prevState,
        hasConfig 
      }));
    };

    return (
      <>
        <FormGroup>
          <ControlLabel>{__('Select person who seeking grant')}</ControlLabel>
          <SelectTeamMembers
            label={__("Choose person who seeking grant")}
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
            label={__("Choose Actions")}
            name="action"
            initialValue={request.action}
            onSelect={onChangeAction}
          />
        </FormGroup>
        {!hasConfig && renderComponent()}
        <ModalFooter>
          <Button btnStyle="simple" disabled={loading}>
            {__('Close')}
          </Button>
          {!!Object.keys(props.request || {}).length && (
            <Button
              btnStyle="danger"
              onClick={props.cancelRequest}
              disabled={loading}
            >
              {loading && <SmallLoader />}
              {__('Cancel')}
            </Button>
          )}
          {props?.renderButton({
            name: 'grant',
            text: __('Grant Request'),
            values: generateDocs(),
            isSubmitted: formProps.isSubmitted,
            object: !!Object.keys(props.request || {}).length ? request : null,
          })}
        </ModalFooter>
      </>
    );
  };

  return <CommonForm renderContent={renderContent} />;
};

export default RequestForm;
