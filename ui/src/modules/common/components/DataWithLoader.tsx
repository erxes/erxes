import EmptyState from 'modules/common/components/EmptyState';
import Spinner from 'modules/common/components/Spinner';
import React from 'react';

type Props = {
  data: any;
  count?: any;
  loading: boolean;
  emptyText?: string;
  emptyIcon?: string;
  emptyImage?: string;
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
    objective: false
  };

  showData() {
    const {
      loading,
      count,
      data,
      emptyIcon,
      emptyImage,
      emptyText,
      size,
      objective,
      emptyContent,
      loadingContent
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

      return (
        <EmptyState
          text={emptyText || 'There is no data'}
          size={size}
          icon={emptyIcon}
          image={emptyImage}
        />
      );
    }

    return data;
  }

  render() {
    return this.showData();
  }
}

export default DataWithLoader;
