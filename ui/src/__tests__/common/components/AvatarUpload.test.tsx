import { mount, shallow } from 'enzyme';
import React from 'react';

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

  test('render Avatar', () => {
    const rendered = mount(<AvatarUpload {...defaultProps} />);
    const found = rendered.find('i').debug();
    const uploadFound = found.search('className="icon-upload-1');

    expect(uploadFound).toBeGreaterThan(-1);
  });

  test('test changed states', () => {
    const defaultStatus = {
      avatarPreviewUrl: 'icon-upload-1'
    };

    const wrapper = mount(<AvatarUpload {...defaultProps} />);

    wrapper.setState({ avatarPreviewUrl: 'icon-upload-1' });

    expect(wrapper.state()).toEqual({
      uploadPreview: null,
      avatarPreviewStyle: {},
      avatarPreviewUrl: defaultStatus.avatarPreviewUrl
    });
  });
});
