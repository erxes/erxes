import { UserCommonInfos } from 'modules/auth/components';
import { IUser, IUserDoc } from 'modules/auth/types';
import { Button, ModalTrigger } from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import * as React from 'react';
import { PasswordConfirmation } from '.';

type Props = {
  currentUser: IUser;
  closeModal: () => void;
  save: (variables: IUserDoc & { password?: string }) => void;
};

type State = {
  avatar: string;
};

class EditProfile extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.onAvatarUpload = this.onAvatarUpload.bind(this);

    const { currentUser } = props;
    const { details } = currentUser;

    this.state = { avatar: details ? details.avatar || '' : '' };
  }

  getInputElementValue(id) {
    return (document.getElementById(id) as HTMLInputElement).value;
  }

  handleSubmit(password) {
    this.props.save({
      username: this.getInputElementValue('username'),
      email: this.getInputElementValue('email'),
      details: {
        avatar: this.state.avatar,
        shortName: this.getInputElementValue('shortName'),
        fullName: this.getInputElementValue('fullName'),
        position: this.getInputElementValue('position'),
        location: this.getInputElementValue('user-location'),
        description: this.getInputElementValue('description')
      },
      links: {
        linkedIn: this.getInputElementValue('linkedin'),
        twitter: this.getInputElementValue('twitter'),
        facebook: this.getInputElementValue('facebook'),
        youtube: this.getInputElementValue('youtube'),
        github: this.getInputElementValue('github'),
        website: this.getInputElementValue('website')
      },
      password
    });

    this.props.closeModal();
  }

  onAvatarUpload(url) {
    this.setState({ avatar: url });
  }

  render() {
    const saveButton = (
      <Button btnStyle="success" icon="checked-1">
        Save
      </Button>
    );

    return (
      <React.Fragment>
        <UserCommonInfos
          user={this.props.currentUser}
          onAvatarUpload={this.onAvatarUpload}
        />

        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={this.props.closeModal}
            icon="cancel-1"
          >
            Cancel
          </Button>

          <ModalTrigger
            title="Enter your password to Confirm"
            trigger={saveButton}
            content={props => (
              <PasswordConfirmation
                {...props}
                onSuccess={password => this.handleSubmit(password)}
              />
            )}
          />
        </ModalFooter>
      </React.Fragment>
    );
  }
}

export default EditProfile;
