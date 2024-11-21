{
  /* <FormGroup>
<ControlLabel>{__('Image')}</ControlLabel>
<Uploader
  defaultFileList={image ? [image] : []}
  onChange={this.onChangeImage}
  single={true}
/>
</FormGroup> */
}

import { __, Sidebar, SidebarList, Uploader } from '@erxes/ui/src';
import Box from '@erxes/ui/src/components/Box';
import React from 'react';
import SelectTag from '../../../tags/containers/SelectTag';
import { IAttachment } from '@erxes/ui/src/types';

type Props = {
  clientPortalId: string;
  post: any;
  onChange: (field: string, value: any) => void;
};

const FeaturedImageSection = (props: Props) => {
  const { post } = props;
  const { Section } = Sidebar;

  const onChangeImage = (images: IAttachment[]) => {
    if (images && images.length > 0) {
      props.onChange('thumbnail', images[0]);
    } else {
      props.onChange('thumbnail', null);
    }
  };
  return (
    <Box title={__('Featured image')} name='image' isOpen={true}>
      <Sidebar.Section>
        <Section>
          <SidebarList className='no-link'>
            <li>
              <div style={{ width: '100%', zIndex: 9999 }}>
                <Uploader
                text='Select featured image'
                  accept='image/x-png,image/jpeg'
                  defaultFileList={post.thumbnail ? [post.thumbnail] : []}
                  onChange={onChangeImage}
                  single={true}
                />
              </div>
            </li>
          </SidebarList>
        </Section>
      </Sidebar.Section>
    </Box>
  );
};

export default FeaturedImageSection;
