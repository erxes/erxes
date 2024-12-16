import PdfUploader from '@erxes/ui/src/components/PdfUploader';
import {
  __,
  ControlLabel,
  FormControl,
  FormGroup,
  Sidebar,
  SidebarList,
  Uploader,
} from '@erxes/ui/src';
import Box from '@erxes/ui/src/components/Box';
import { IAttachment, IPdfAttachment } from '@erxes/ui/src/types';
import React from 'react';
import styled from 'styled-components';

type Props = {
  clientPortalId: string;
  post: any;
  onChange: (field: string, value: any) => void;
};

export const SidebarContent = styled.div`
  padding: 10px;
`;

const MediaSection = (props: Props) => {
  const { post } = props;
  const mediaKinds = [
    'thumbnail',
    'images',
    'video',
    'audio',
    'documents',
    'attachments',
  ];
  const { Section } = Sidebar;

  const onChange = (files: IAttachment[], kind: string) => {
    if (kind === 'images' || kind === 'attachments' || kind === 'documents') {
      return props.onChange(kind, files);
    }

    if (files && files.length > 0) {
      props.onChange(kind, files[0]);
    } else {
      props.onChange(kind, null);
    }
  };

  const getUploaderProps = (kind: string) => {
    let title = '';
    let description = '';
    let uploaderProps: any = {};
    switch (kind) {
      case 'thumbnail':
        title = __('Featured image');
        uploaderProps.defaultFileList = post.thumbnail ? [post.thumbnail] : [];
        uploaderProps.text = __('Upload featured image');
        uploaderProps.accept = 'image/*';
        uploaderProps.single = true;
        description = __(
          'Image can be shown on the top of the post also in the list view'
        );
        uploaderProps.icon = 'image-plus';

        break;
      case 'images':
        title = __('Image gallery');
        uploaderProps.defaultFileList = post.images;
        uploaderProps.text = __('Upload images');
        uploaderProps.accept = 'image/*';
        uploaderProps.multiple = true;
        uploaderProps.limit = 10;
        description = __('Image gallery with maximum of 10 images');
        uploaderProps.icon = 'image-plus';

        break;
      case 'video':
        title = __('Video');
        uploaderProps.defaultFileList = post.video ? [post.video] : [];
        uploaderProps.text = __('Upload video');
        uploaderProps.accept = 'video/*';
        uploaderProps.single = true;
        uploaderProps.icon = 'video';
        // description = __('Video can be shown on the top of the post also in the list view');
        break;
      case 'audio':
        title = __('Audio');
        uploaderProps.defaultFileList = post.audio ? [post.audio] : [];
        uploaderProps.text = __('Upload audio');
        uploaderProps.accept = 'audio/*';
        uploaderProps.single = true;
        description = __('Can be used for audio podcast');
        uploaderProps.icon = 'music-1';
        break;
      case 'documents':
        title = __('Documents');
        uploaderProps.defaultFileList = post.documents;
        uploaderProps.text = __('Upload documents');
        uploaderProps.accept =
          'application/pdf,application/octet-stream,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        uploaderProps.multiple = true;
        uploaderProps.icon = 'document';
        break;
      case 'attachments':
        title = __('Attachments');
        uploaderProps.defaultFileList = post.attachments;
        uploaderProps.text = __('Upload attachments');
        uploaderProps.multiple = true;
        uploaderProps.icon = 'file-plus';
        break;
    }

    return {
      title,
      description,
      uploaderProps,
    };
  };

  return (
    <Box title={'Media'} name='image' isOpen={true}>
      <Sidebar.Section>
        <Section>
          <SidebarList className='no-link'>
            <SidebarContent>
              {mediaKinds.map((kind) => {
                const { title, description, uploaderProps } =
                  getUploaderProps(kind);
                return (
                  <FormGroup>
                    <ControlLabel>{title}</ControlLabel>
                    <p>{description}</p>
                    <Uploader
                      key={kind}
                      onChange={(images) => onChange(images, kind)}
                      {...uploaderProps}
                    />
                    <hr />
                  </FormGroup>
                );
              })}
              <FormGroup>
                <ControlLabel>{'Newspaper & Magazine'}</ControlLabel>
                <p>{'Pages of PDF file will be turned into images'}</p>
                <PdfUploader
                  attachment={post.pdfAttachment}
                  onChange={(attachment?: IPdfAttachment) => {
                    props.onChange('pdfAttachment', attachment);
                  }}
                />
                <hr />
              </FormGroup>

              <FormGroup>
                <ControlLabel>{'Video'}</ControlLabel>
                <p>{__('Video link such as YouTube, Vimeo or Embed code')}</p>
                <FormControl
                  type='text'
                  value={post.videoUrl}
                  onChange={(e: any) =>
                    props.onChange('videoUrl', e.target.value)
                  }
                />
              </FormGroup>
            </SidebarContent>
          </SidebarList>
        </Section>
      </Sidebar.Section>
    </Box>
  );
};

export default MediaSection;
