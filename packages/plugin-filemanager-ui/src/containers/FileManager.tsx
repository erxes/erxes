import React from 'react';
import FileManager from '../components/FileManager';

type Props = {
  queryParams: any;
};

type FinalProps = {} & Props;

class FileManagerContainer extends React.Component<FinalProps> {
  render() {
    const updatedProps = {
      ...this.props
    };

    return <FileManager {...updatedProps} />;
  }
}

export default FileManagerContainer;
