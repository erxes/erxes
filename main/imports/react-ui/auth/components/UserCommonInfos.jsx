import React, { PropTypes } from 'react';
import {
  FormGroup,
  ControlLabel,
  FormControl,
} from 'react-bootstrap';
import uploadHandler from '/imports/api/client/uploadHandler';


const propTypes = {
  user: PropTypes.object.isRequired,
};

class UserCommonInfos extends React.Component {
  constructor(props) {
    super(props);

    const defaultAvatar = '/assets/images/userDefaultIcon.png';

    this.state = {
      avatar: this.props.user.details.avatar,
      avatarPreviewUrl: this.props.user.details.avatar || defaultAvatar,
      avatarPreviewStyle: {},
    };

    this.handleImageChange = this.handleImageChange.bind(this);
  }

  handleImageChange(e) {
    const imageFile = e.target.files[0];

    uploadHandler({
      file: imageFile,

      beforeUpload: () => {
        this.setState({ avatarPreviewStyle: { opacity: '0.2' } });
      },

      afterUpload: ({ response }) => {
        this.setState({
          avatar: response.url,
          avatarPreviewStyle: { opacity: '1' },
        });
      },

      afterRead: ({ result }) => {
        this.setState({ avatarPreviewUrl: result });
      },
    });
  }

  render() {
    const user = this.props.user;
    const { avatar, avatarPreviewStyle, avatarPreviewUrl } = this.state;

    return (
      <div>
        <FormGroup>
          <ControlLabel>Photo</ControlLabel>

          <img
            alt="avatar"
            className="avatar"
            style={avatarPreviewStyle}
            src={avatarPreviewUrl}
          />

          <FormControl
            type="file"
            onChange={this.handleImageChange}
          />
          <input
            type="hidden"
            id="avatar"
            value={avatar}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Name</ControlLabel>
          <FormControl
            type="text"
            id="fullName"
            defaultValue={user.details.fullName}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Username</ControlLabel>
          <FormControl
            type="text"
            id="username"
            defaultValue={user.username}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Email</ControlLabel>
          <FormControl
            type="email"
            id="email"
            defaultValue={user.emails[0].address}
          />
        </FormGroup>
      </div>
    );
  }
}

UserCommonInfos.propTypes = propTypes;

export default UserCommonInfos;
