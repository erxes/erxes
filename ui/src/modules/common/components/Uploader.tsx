import { __, Alert, uploadHandler } from 'modules/common/utils';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { rgba } from '../styles/color';
import colors from '../styles/colors';
import { IAttachment } from '../types';
import Attachment from './Attachment';
import Spinner from './Spinner';

const List = styled.div`
  margin: 10px 0;
`;

const Item = styled.div`
  margin-bottom: 10px;
`;

const Delete = styled.span`
  text-decoration: underline;

  &:hover {
    color: ${colors.colorCoreBlack};
    cursor: pointer;
  }
`;

const UploadBtn = styled.div`
  position: relative;
  margin-top: 10px;

  label {
    padding: 8px 20px;
    background: ${rgba(colors.colorCoreDarkBlue, 0.05)};
    border-radius: 20px;
    font-weight: 500;
    transition: background 0.3s ease;
    display: inline-block;

    &:hover {
      background: ${rgba(colors.colorCoreDarkBlue, 0.1)};
      cursor: pointer;
    }
  }

  input[type='file'] {
    display: none;
  }
`;

type Props = {
  defaultFileList: IAttachment[];
  onChange: (attachments: IAttachment[]) => void;
  limit?: number;
  multiple?: boolean;
};

function Uploader(props: Props) {
  const [attachments, setAttachments] = useState(props.defaultFileList);
  const [loading, setLoading] = useState(false);

  useEffect(
    () => {
      setAttachments(props.defaultFileList);
    },
    [props.defaultFileList]
  );

  function handleFileInput({ target }) {
    const files = target.files;

    uploadHandler({
      files,

      beforeUpload: () => {
        setLoading(true);
      },

      afterUpload: ({ status, response, fileInfo }) => {
        if (status !== 'ok') {
          Alert.error(response);

          return setLoading(false);
        }

        Alert.info('Success');

        setLoading(false);

        // set attachments
        const attachment = { url: response, ...fileInfo };
        const updated = [...attachments, attachment];

        setAttachments(updated);
        props.onChange(updated);
      }
    });

    target.value = '';
  }

  function removeAttachmentByIndex(index: number) {
    const updated = [...attachments];

    updated.splice(index, 1);

    setAttachments(updated);
    props.onChange(updated);
  }

  function renderItem(item: IAttachment, index: number) {
    const removeAttachment = () => removeAttachmentByIndex(index);
    const remove = <Delete onClick={removeAttachment}>{__('Delete')}</Delete>;

    return (
      <Item key={item.url}>
        <Attachment attachment={item} additionalItem={remove} />
      </Item>
    );
  }

  function renderBtn() {
    const { multiple, limit } = props;

    if (limit && limit === attachments.length) {
      return null;
    }

    return (
      <UploadBtn>
        <label>
          {__('Upload an attachment')}
          <input type="file" multiple={multiple} onChange={handleFileInput} />
        </label>
        {loading && (
          <Spinner size={18} top="auto" bottom="0" left="auto" right="10px" />
        )}
      </UploadBtn>
    );
  }

  return (
    <>
      <List>{attachments.map((item, index) => renderItem(item, index))}</List>
      {renderBtn()}
    </>
  );
}

Uploader.defaultProps = {
  multiple: true,
  defaultFileList: []
};

export default Uploader;
