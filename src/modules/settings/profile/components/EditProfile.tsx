import { UserCommonInfos } from 'modules/auth/components';
import { IUser } from 'modules/auth/types';
import { Button, ModalTrigger } from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import React, { Component, Fragment } from 'react';
import { PasswordConfirmation } from '.';

type Props = {
  currentUser: IUser,
  closeModal?: () => void,
  save: (save: { username: string, email: string, details: any, links: any, password: string }) => void
};

type State = {
  avatar: string
}

class EditProfile extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.onAvatarUpload = this.onAvatarUpload.bind(this);

    this.state = { avatar: props.currentUser.details.avatar };
  }

  handleSubmit(password) {
    this.props.save({
      username: (document.getElementById('username') as HTMLInputElement).value,
      email: (document.getElementById('email') as HTMLInputElement).value,
      details: {
        avatar: this.state.avatar,
        fullName: (document.getElementById('fullName') as HTMLInputElement).value,
        position:(document.getElementById('position') as HTMLInputElement).value,
        location: (document.getElementById('user-location') as HTMLInputElement).value,
        description: (document.getElementById('description') as HTMLInputElement).value
      },
      links: {
        linkedIn: (document.getElementById('linkedin') as HTMLInputElement).value,
        twitter: (document.getElementById('twitter') as HTMLInputElement).value,
        facebook: (document.getElementById('facebook') as HTMLInputElement).value,
        youtube: (document.getElementById('youtube') as HTMLInputElement).value,
        github: (document.getElementById('github') as HTMLInputElement).value,
        website: (document.getElementById('website') as HTMLInputElement).value
      },
      password
    });

    this.props.closeModal;
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
      <Fragment>
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
            content={(props) => <PasswordConfirmation {...props} onSuccess={password => this.handleSubmit(password)} /> }
          />
        </ModalFooter>
      </Fragment>
    );
  }
}

export default EditProfile;
