import {
  ClientPortalConfig,
  IClientPortalUser,
  IClientPortalUserDoc
} from '../../types';
import React from 'react';
import validator from 'validator';
import { IUser } from '@erxes/ui/src/auth/types';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { generateCategoryOptions, __ } from '@erxes/ui/src/utils';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormControl from '@erxes/ui/src/components/form/Control';
import CollapseContent from '@erxes/ui/src/components/CollapseContent';
import AutoCompletionSelect from '@erxes/ui/src/components/AutoCompletionSelect';
import Button from '@erxes/ui/src/components/Button';
import { Form } from '@erxes/ui/src/components/form';
import {
  ScrollWrapper,
  FormWrapper,
  FormColumn,
  ModalFooter
} from '@erxes/ui/src/styles/main';

type Props = {
  currentUser: IUser;
  clientPortalUser?: IClientPortalUser;
  closeModal: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  clientPortalGetConfigs: ClientPortalConfig[];
};

type State = {
  ownerId: string;
  isSubscribed: string;
  hasAuthority: string;
  users: IUser[];
  avatar: string;
  phone?: string;
  email?: string;
};

class CustomerForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const clientPortalUser =
      props.clientPortalUser || ({} as IClientPortalUser);
    const userId = props.currentUser ? props.currentUser._id : '';

    this.state = {
      ownerId: clientPortalUser.ownerId || userId,
      isSubscribed: clientPortalUser.isSubscribed || 'Yes',
      hasAuthority: clientPortalUser.hasAuthority || 'No',
      users: [],
      avatar: clientPortalUser.avatar
    };
  }

  generateDoc = (values: { _id: string } & IClientPortalUserDoc) => {
    const { clientPortalUser } = this.props;
    const finalValues = values;

    if (clientPortalUser) {
      finalValues._id = clientPortalUser._id;
    }

    return {
      _id: finalValues._id,
      ...this.state,
      firstName: finalValues.firstName,
      lastName: finalValues.lastName,
      username: finalValues.username,
      code: finalValues.code,
      email: finalValues.email,
      phone: finalValues.phone,
      erxesCustomerId: finalValues.erxesCustomerId,
      erxesCompanyId: finalValues.erxesCompanyId,
      clientPortalId: finalValues.clientPortalId
    };
  };

  onOwnerChange = ownerId => {
    this.setState({ ownerId });
  };

  onChange = e => {
    this.setState(e.target.value);
  };

  renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton, clientPortalGetConfigs } = this.props;
    const { values, isSubmitted, resetSubmit } = formProps;

    const clientPortalUser =
      this.props.clientPortalUser || ({} as IClientPortalUser);

    return (
      <>
        <ScrollWrapper>
          <CollapseContent
            title={__('General information')}
            compact={true}
            open={true}
          >
            <FormWrapper>
              <FormColumn>
                <FormGroup>
                  <ControlLabel required={true}>First Name</ControlLabel>
                  <FormControl
                    {...formProps}
                    defaultValue={clientPortalUser.firstName || ''}
                    autoFocus={true}
                    required={true}
                    name="firstName"
                  />
                </FormGroup>

                <FormGroup>
                  <ControlLabel>Last Name</ControlLabel>
                  <FormControl
                    {...formProps}
                    name="lastName"
                    defaultValue={clientPortalUser.lastName || ''}
                  />
                </FormGroup>

                <FormGroup>
                  <ControlLabel>User Name</ControlLabel>
                  <FormControl
                    {...formProps}
                    name="username"
                    defaultValue={clientPortalUser.username || ''}
                  />
                </FormGroup>
              </FormColumn>
              <FormColumn>
                <FormGroup>
                  <ControlLabel>Code</ControlLabel>
                  <FormControl
                    {...formProps}
                    name="code"
                    defaultValue={clientPortalUser.code || ''}
                  />
                </FormGroup>
                <FormGroup>
                  <ControlLabel required={true}>Email</ControlLabel>
                  <FormControl
                    {...formProps}
                    name="email"
                    required={true}
                    defaultValue={clientPortalUser.email || ''}
                  />
                </FormGroup>
                <FormGroup>
                  <ControlLabel>Phone</ControlLabel>
                  <FormControl
                    {...formProps}
                    name="phone"
                    defaultValue={clientPortalUser.phone || ''}
                  />
                </FormGroup>
                <FormGroup>
                  <ControlLabel>ClientPortal</ControlLabel>
                  <FormControl
                    {...formProps}
                    name="clientPortalId"
                    componentClass="select"
                    defaultValue={clientPortalUser.clientPortalId}
                    required={true}
                    onChange={this.onChange}
                  >
                    <option />
                    {clientPortalGetConfigs.map((cp, index) => (
                      <option key={index} value={cp._id}>
                        {cp.name}
                      </option>
                    ))}
                  </FormControl>
                </FormGroup>
              </FormColumn>
            </FormWrapper>
          </CollapseContent>
          <CollapseContent title={__('Links')} compact={true} children={''} />
        </ScrollWrapper>
        <ModalFooter>
          <Button
            btnStyle="simple"
            uppercase={false}
            onClick={closeModal}
            icon="times-circle"
          >
            Close
          </Button>

          {renderButton({
            name: 'clientPortalUser',
            values: this.generateDoc(values),
            isSubmitted,
            object: this.props.clientPortalUser,
            resetSubmit
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default CustomerForm;
