import { mount, shallow } from 'enzyme';
import * as React from 'react';
import AvatarUpload from '../../../modules/common/components/AvatarUpload';

describe('AvatarUpload component', () => {
  const defaultProps = {
    avatar: 'aa',
    defaultAvatar: 'icon-upload-1',

    onAvatarUpload: (response: any) => null
  };

  test('renders succesfully', () => {
    shallow(<AvatarUpload {...defaultProps} />);
  });

  test('renders with Avatars default props', () => {
    const control = mount(<AvatarUpload {...defaultProps} />);
    const props = control.props();

    expect(props).toMatchObject(defaultProps);
  });

  test('renders test 2 different props', () => {
    defaultProps.avatar = 'email';
    defaultProps.defaultAvatar = 'icon-upload-2';

    const rendered = mount(<AvatarUpload {...defaultProps} />);
    const props = rendered.props();

    expect(defaultProps).toMatchObject(props);
  });

  test('render Avatar', () => {
    const rendered = mount(<AvatarUpload {...defaultProps} />);
    const found = rendered.find('i').debug();
    const uploadFound = found.search('className="icon-upload-1');

    expect(uploadFound).toBeGreaterThan(-1);
  });

  test('test changed states', () => {
    const avatarPreUrl = 'icon-upload-1';

    const wrapper = mount(<AvatarUpload {...defaultProps} />);

    wrapper.setState({ avatarPreviewUrl: avatarPreUrl });

    expect(wrapper.state()).toEqual({
      uploadPreview: null,
      avatarPreviewStyle: {},
      avatarPreviewUrl: avatarPreUrl
    });
  });
});
