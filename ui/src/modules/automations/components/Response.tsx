import React from 'react';

type Props = {
  isLoading: boolean;
  response: any;
};

type State = {};

class Response extends React.Component<Props, State> {
  render() {
    const { isLoading, response } = this.props;
    console.log('responseeeeeeeeeeee', response);

    if (!isLoading) {
      return '';
    }

    if (!response) {
      return '';
    }

    if (response) {
      const doc = document;
      doc.open();
      doc.write(response);
    }
    return <></>;
  }
}

export default Response;
