import {
  ClientPortalConfig,
  IClientPortalUser,
  IClientPortalUserDoc,
} from '../../types';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React, { useState } from 'react';

import Button from '@erxes/ui/src/components/Button';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { Form } from '@erxes/ui/src/components/form';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { IUser } from '@erxes/ui/src/auth/types';
import { __ } from '@erxes/ui/src/utils';

type Props = {
  currentUser: IUser;
  clientPortalUser?: IClientPortalUser;
  closeModal: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  clientPortalGetConfigs: ClientPortalConfig[];
};

type State = {
  oldClientPortalId: string;
  newClientPortalId: string;
};

const ClientPortalMoveForm: React.FC<Props> = (props: Props) => {
  const [state, setState] = useState<State>({
    oldClientPortalId: '',
    newClientPortalId: '',
  });

  const generateDoc = (
    values: {
      oldClientPortalId: string;
      newClientPortalId: string;
    } & IClientPortalUserDoc
  ) => {
    const finalValues = values;

    const doc: any = {
      oldClientPortalId: finalValues.oldClientPortalId,
      newClientPortalId: finalValues.newClientPortalId,
    };

    return doc;
  };

  const onChange = (e: any) => {
    setState((prevState) => ({
      ...prevState,
      oldClientPortalId: e.target.value,
    }));
  };

  const onNewChange = (e: any) => {
    setState((prevState) => ({
      ...prevState,
      newClientPortalId: e.target.value,
    }));
  };

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted, resetSubmit } = formProps;

    return (
      <>
        <FormGroup>
          <ControlLabel>Current Client portal</ControlLabel>
          <FormControl
            {...formProps}
            name="oldClientPortalId"
            componentclass="select"
            defaultValue={state.oldClientPortalId}
            required={true}
            onChange={onChange}
          >
            <option />
            {props.clientPortalGetConfigs.map((cp, index) => (
              <option key={index} value={cp._id}>
                {cp.name}
              </option>
            ))}
          </FormControl>
        </FormGroup>

        <FormGroup>
          <ControlLabel>Move Client portal</ControlLabel>
          <FormControl
            {...formProps}
            name="newClientPortalId"
            componentclass="select"
            defaultValue={state.newClientPortalId}
            required={true}
            onChange={onNewChange}
          >
            <option />
            {props.clientPortalGetConfigs.map((cp, index) => (
              <option key={index} value={cp._id}>
                {cp.name}
              </option>
            ))}
          </FormControl>
        </FormGroup>
        <ModalFooter>
          <Button
            btnStyle="simple"
            uppercase={false}
            onClick={props.closeModal}
            icon="times-circle"
          >
            Close
          </Button>

          {props.renderButton({
            name: 'clientPortalUser',
            values: generateDoc(values),
            isSubmitted,
            resetSubmit,
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default ClientPortalMoveForm;
