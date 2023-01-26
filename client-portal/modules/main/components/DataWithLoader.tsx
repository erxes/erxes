import React from 'react';
import Spinner from '../../common/Spinner';

type Props = {
  data: any;
  count?: any;
  loading: boolean;
  size?: string;
  objective?: boolean;
  emptyContent?: React.ReactNode;
  loadingContent?: React.ReactNode;
};

class DataWithLoader extends React.Component<Props> {
  static defaultProps = {
    emptyText: 'There is no data',
    emptyIcon: '',
    emptyImage: '',
    size: 'full',
    objective: false,
  };

  showData() {
    const {
      loading,
      count,
      data,
      objective,
      emptyContent,
      loadingContent,
    } = this.props;

    if (loading) {
      if (loadingContent) {
        return loadingContent;
      }

      return <Spinner objective={objective} />;
    }

    if (count === 0) {
      if (emptyContent) {
        return emptyContent;
      }

      return <h4>There is no notification</h4>;
    }

    return data;
  }

  render() {
    return this.showData();
  }
}

export default DataWithLoader;
