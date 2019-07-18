import { __, Alert, uploadHandler } from 'modules/common/utils';
import React from 'react';
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
    border-radius: 4px;
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
  multiple?: boolean;
};

type State = {
  attachments: IAttachment[];
  loading: boolean;
};

class Uploader extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { defaultFileList } = this.props;

    this.state = {
      attachments: defaultFileList || [],
      loading: false
    };
  }

  handleFileInput = e => {
    const files = e.target.files;

    uploadHandler({
      files,

      beforeUpload: () => {
        this.setState({
          loading: true
        });
      },

      afterUpload: ({ status, response, fileInfo }) => {
        if (status !== 'ok') {
          Alert.error(response);
          return this.setState({ loading: false });
        }

        Alert.info('Success');

        // set attachments
        const attachment = { url: response, ...fileInfo };

        const attachments = [...this.state.attachments, attachment];

        this.props.onChange(attachments);

        this.setState({
          loading: false,
          attachments
        });
      }
    });
  };

  removeAttachment = (index: number) => {
    const attachments = [...this.state.attachments];

    attachments.splice(index, 1);

    this.setState({ attachments });

    this.props.onChange(attachments);
  };

  renderItem = (item: IAttachment, index: number) => {
    const removeAttachment = () => this.removeAttachment(index);
    const remove = <Delete onClick={removeAttachment}>{__('Delete')}</Delete>;

    return (
      <Item key={item.url}>
        <Attachment attachment={item} additionalItem={remove} />
      </Item>
    );
  };

  render() {
    const { loading, attachments } = this.state;
    const { multiple = true } = this.props;

    return (
      <>
        <List>
          {attachments.map((item, index) => this.renderItem(item, index))}
        </List>
        <UploadBtn>
          <label>
            Upload an attachment
            <input
              type="file"
              multiple={multiple}
              onChange={this.handleFileInput}
            />
          </label>
          {loading && (
            <Spinner size={18} top="auto" bottom="0" left="auto" right="10px" />
          )}
        </UploadBtn>
      </>
    );
  }
}

export default Uploader;
