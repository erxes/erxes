import {
  ClientPortalConfig,
  IClientPortalUser,
  IClientPortalUserDoc,
} from '../../types';
import {
  FormColumn,
  FormWrapper,
  ModalFooter,
  ScrollWrapper,
} from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React, { useEffect, useState } from 'react';

import AvatarUpload from '@erxes/ui/src/components/AvatarUpload';
import Button from '@erxes/ui/src/components/Button';
import CollapseContent from '@erxes/ui/src/components/CollapseContent';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { Form } from '@erxes/ui/src/components/form';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { IUser } from '@erxes/ui/src/auth/types';
import SelectCompanies from '@erxes/ui-contacts/src/companies/containers/SelectCompanies';
import { USER_LOGIN_TYPES } from '../../constants';
import { __ } from '@erxes/ui/src/utils';

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
  type: string;
  erxesCompanyId?: string;
  req: boolean;
  activeSections: any;
  password?: string;
  disableVerificationMail?: boolean;
  clientPortalId: string;
};

const CustomerForm: React.FC<Props> = (props: Props) => {
  const [state, setState] = useState<State>({
    ownerId: '',
    isSubscribed: 'Yes',
    hasAuthority: 'No',
    users: [],
    avatar: '',
    phone: '',
    email: '',
    type: 'customer',
    erxesCompanyId: '',
    req: true,
    activeSections: {
      renderClientPortalUser: false,
      renderClientPortalCompany: false,
    },
    password: '',
    disableVerificationMail: false,
    clientPortalId: '',
  });

  useEffect(() => {
    const { currentUser, clientPortalUser } = props;
    const userId = currentUser ? currentUser._id : '';

    setState((prevState) => ({
      ...prevState,
      type: clientPortalUser?.type || 'customer',
      ownerId: clientPortalUser?.ownerId || userId,
      isSubscribed: clientPortalUser?.isSubscribed || 'Yes',
      hasAuthority: clientPortalUser?.hasAuthority || 'No',
      avatar: clientPortalUser?.avatar || '',
      erxesCompanyId: clientPortalUser?.erxesCompanyId || '',
      disableVerificationMail: false,
      clientPortalId: clientPortalUser?.clientPortalId || '',
    }));
  }, [props.clientPortalUser, props.currentUser]);

  const generateDoc = (
    values: { _id: string; password?: string } & IClientPortalUserDoc
  ) => {
    const { clientPortalUser } = props;
    const finalValues = values;

    if (clientPortalUser) {
      finalValues._id = clientPortalUser._id;
    }

    const doc: any = {
      _id: finalValues._id,
      ...state,
      firstName: finalValues.firstName,
      lastName: finalValues.lastName,
      username: finalValues.username,
      code: finalValues.code,
      email: finalValues.email,
      phone: finalValues.phone,
      companyName: finalValues.companyName,
      companyRegistrationNumber: finalValues.companyRegistrationNumber,
      type: finalValues.type,
      erxesCustomerId: finalValues.erxesCustomerId,
      erxesCompanyId: state.erxesCompanyId,
      clientPortalId: finalValues.clientPortalId,
    };
    if (state.password) {
      doc.password = state.password;
    }

    doc.disableVerificationMail = state.disableVerificationMail;

    return doc;
  };

  const onOwnerChange = (ownerId: string) => {
    setState((prevState) => ({ ...prevState, ownerId }));
  };

  const onChange = (e: any) => {
    setState((prevState) => ({ ...prevState, clientPortalId: e.target.value }));
  };

  const onAvatarUpload = (url: string) => {
    setState((prevState) => ({ ...prevState, avatar: url }));
  };

  const renderSelectOptions = () => {
    return USER_LOGIN_TYPES.map((e) => {
      return (
        <option key={e.value} value={e.value}>
          {e.label}
        </option>
      );
    });
  };

  const onChangeContent = (e: any) => {
    setState((prevState) => ({ ...prevState, type: e.target.value }));
  };

  const onChangeCompany = (erxesCompanyId) => {
    setState((prevState) => ({ ...prevState, erxesCompanyId }));
  };

  const renderClientPortalUser = (formProps: IFormProps) => {
    const clientPortalUser =
      props.clientPortalUser || ({} as IClientPortalUser);

    return (
      <>
        <CollapseContent
          title={__('General information')}
          compact={true}
          open={true}
        >
          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <AvatarUpload
                  avatar={clientPortalUser.avatar}
                  onAvatarUpload={onAvatarUpload}
                />
              </FormGroup>
            </FormColumn>
          </FormWrapper>
          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel required={true}>First Name</ControlLabel>
                <FormControl
                  {...formProps}
                  defaultValue={clientPortalUser.firstName || ''}
                  autoFocus={true}
                  required={true}
                  name='firstName'
                />
              </FormGroup>

              <FormGroup>
                <ControlLabel>Last Name</ControlLabel>
                <FormControl
                  {...formProps}
                  name='lastName'
                  defaultValue={clientPortalUser.lastName || ''}
                />
              </FormGroup>

              <FormGroup>
                <ControlLabel>User Name</ControlLabel>
                <FormControl
                  {...formProps}
                  name='username'
                  defaultValue={clientPortalUser.username || ''}
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>Company</ControlLabel>
                <SelectCompanies
                  initialValue={clientPortalUser.erxesCompanyId}
                  label={__('Select a company')}
                  name='companyId'
                  onSelect={onChangeCompany}
                  multi={false}
                />
              </FormGroup>
            </FormColumn>
            <FormColumn>
              <FormGroup>
                <ControlLabel>Code</ControlLabel>
                <FormControl
                  {...formProps}
                  name='code'
                  defaultValue={clientPortalUser.code || ''}
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel required={true}>Email</ControlLabel>
                <FormControl
                  {...formProps}
                  name='email'
                  required={true}
                  defaultValue={clientPortalUser.email || ''}
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>Phone</ControlLabel>
                <FormControl
                  {...formProps}
                  name='phone'
                  defaultValue={clientPortalUser.phone || ''}
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>ClientPortal</ControlLabel>
                <FormControl
                  {...formProps}
                  name='clientPortalId'
                  componentclass='select'
                  defaultValue={clientPortalUser.clientPortalId}
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
            </FormColumn>
          </FormWrapper>
        </CollapseContent>

        <CollapseContent title='Authentication' compact={true} open={true}>
          <FormGroup>
            <ControlLabel>{clientPortalUser._id ? 'Reset password' : 'Password'}</ControlLabel>
            <FormControl
              {...formProps}
              name='password'
              type='password'
              onChange={(e: any) =>
                setState((prevState) => ({
                  ...prevState,
                  password: e.target.value,
                }))
              }
              onFocus={() =>
                setState((prevState) => ({ ...prevState, password: '' }))
              }
            />
          </FormGroup>

          {!clientPortalUser._id && (
            <FormGroup>
              <ControlLabel>Send invitation email</ControlLabel>
              <FormControl
                {...formProps}
                name='disableVerificationMail'
                componentclass='checkbox'
                defaultChecked={false}
                onChange={(e: any) =>
                  setState((prevState) => ({
                    ...prevState,
                    disableVerificationMail: !e.target.checked,
                  }))
                }
              />
            </FormGroup>
          )}
        </CollapseContent>
      </>
    );
  };

  const renderClientPortalCompany = (formProps: IFormProps) => {
    const clientPortalUser =
      props.clientPortalUser || ({} as IClientPortalUser);

    return (
      <CollapseContent
        title={__('General information')}
        compact={true}
        open={true}
      >
        <FormWrapper>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Company Name</ControlLabel>
              <FormControl
                {...formProps}
                defaultValue={clientPortalUser.companyName || ''}
                autoFocus={true}
                required={true}
                name='companyName'
              />
            </FormGroup>

            <FormGroup>
              <ControlLabel>Company Registration Number</ControlLabel>
              <FormControl
                {...formProps}
                name='companyRegistrationNumber'
                defaultValue={clientPortalUser.companyRegistrationNumber || ''}
              />
            </FormGroup>
          </FormColumn>
          <FormColumn>
            <FormGroup>
              <ControlLabel required={true}>Email</ControlLabel>
              <FormControl
                {...formProps}
                name='email'
                required={true}
                defaultValue={clientPortalUser.email || ''}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>Phone</ControlLabel>
              <FormControl
                {...formProps}
                name='phone'
                defaultValue={clientPortalUser.phone || ''}
              />
            </FormGroup>
            <FormGroup>
              <ControlLabel>ClientPortal</ControlLabel>
              <FormControl
                {...formProps}
                name='clientPortalId'
                componentclass='select'
                defaultValue={clientPortalUser.clientPortalId}
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
          </FormColumn>
        </FormWrapper>
      </CollapseContent>
    );
  };

  const renderContent = (formProps: IFormProps) => {
    const { values, isSubmitted, resetSubmit } = formProps;

    return (
      <>
        <ScrollWrapper>
          <FormGroup>
            <ControlLabel>Business Portal User Type</ControlLabel>
            <FormControl
              {...formProps}
              name='type'
              componentclass='select'
              defaultValue={state.type}
              required={true}
              onChange={onChangeContent}
            >
              {renderSelectOptions()}
            </FormControl>
          </FormGroup>

          {state.type === 'customer'
            ? renderClientPortalUser(formProps)
            : renderClientPortalCompany(formProps)}
        </ScrollWrapper>
        <ModalFooter>
          <Button
            btnStyle='simple'
            uppercase={false}
            onClick={props.closeModal}
            icon='times-circle'
          >
            Close
          </Button>

          {props.renderButton({
            name: 'clientPortalUser',
            values: generateDoc(values),
            isSubmitted,
            object: props.clientPortalUser,
            resetSubmit,
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default CustomerForm;
