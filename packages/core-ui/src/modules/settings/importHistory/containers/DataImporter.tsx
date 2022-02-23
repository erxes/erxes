import { AppConsumer } from 'appContext';
import { Alert } from 'modules/common/utils';
import React from 'react';
import DataImporter from '../components/DataImporter';
import { handleXlsUpload } from '../utils';

type Props = {
  showLoadingBar: () => void;
  closeLoadingBar: () => void;
  type: string;
  text: string;
};

type State = {
  uploadingCsv: boolean;
};

class DataImporterContainer extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      uploadingCsv: false
    };
  }

  render() {
    const { showLoadingBar, type, closeLoadingBar } = this.props;

    const uploadCsv = e => {
      closeLoadingBar();

      handleXlsUpload({
        e,
        type,
        beforeUploadCallback: () => {
          this.setState({ uploadingCsv: true });
        },
        afterUploadCallback: response => {
          this.setState({ uploadingCsv: false });

          if (response.status === 'error') {
            return Alert.error(response.message);
          }

          if (response.id) {
            localStorage.setItem('erxes_import_data', response.id);
            showLoadingBar();
          }
        }
      });
    };

    return (
      <DataImporter
        {...this.props}
        uploadCsv={uploadCsv}
        uploading={this.state.uploadingCsv}
      />
    );
  }
}

const WithConsumer = props => {
  return (
    <AppConsumer>
      {({ showLoadingBar, closeLoadingBar }) => (
        <DataImporterContainer
          {...props}
          showLoadingBar={showLoadingBar}
          closeLoadingBar={closeLoadingBar}
        />
      )}
    </AppConsumer>
  );
};

export default WithConsumer;
