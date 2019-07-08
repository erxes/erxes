import { Icon, Spinner } from 'modules/common/components';
import { Alert, uploadHandler } from 'modules/common/utils';
import React from 'react';
import styled from 'styled-components';
import { IAttachment } from '../types';

const List = styled.div`
  margin: 10px 0;
`;

const Item = styled.div`
  margin: 5px 0;

  a {
    float: left;
    width: 95%;
    overflow: hidden;
    padding-right: 5px;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  span {
    i {
      color: red;
    }

    &:hover {
      cursor: hand;
    }
  }
`;

const UploadBtn = styled.div`
  position: relative;
`;

type Props = {
  defaultFileList: IAttachment[];
  onChange: (attachments: IAttachment[]) => void;
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

  removeAttachment = e => {
    const attachments = [...this.state.attachments];

    const index = attachments.indexOf(e);

    attachments.splice(index, 1);

    this.setState({ attachments });

    this.props.onChange(attachments);
  };

  renderItem = (item: IAttachment) => (
    <Item key={item.url}>
      <a rel="noopener noreferrer" target="_blank" href={item.url}>
        {item.name}
      </a>

      <span onClick={this.removeAttachment}>
        <Icon icon="cancel-1" />
      </span>
    </Item>
  );

  render() {
    const { loading, attachments } = this.state;

    return (
      <>
        <List>{attachments.map(item => this.renderItem(item))}</List>
        <UploadBtn>
          {loading && (
            <Spinner size={18} top="auto" bottom="0" left="auto" right="10px" />
          )}
          <input type="file" multiple={true} onChange={this.handleFileInput} />
        </UploadBtn>
      </>
    );
  }
}

export default Uploader;
