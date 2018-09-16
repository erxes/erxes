import {
  Button,
  DataWithLoader,
  ModalTrigger,
  Pagination
} from 'modules/common/components';
import { Wrapper } from 'modules/layout/components';
import { IIntegration } from 'modules/settings/integrations/types';
import Sidebar from 'modules/settings/Sidebar';
import * as React from 'react';

type Props = {
  objects: any
  remove: (integation: IIntegration) => void,
  save: () => void,
  refetch: () => void,
  totalCount: number
  loading: boolean
};

class List extends React.Component<Props, {}> {
  public title
  public size

  constructor(props: Props) {
    super(props);

    this.renderObjects = this.renderObjects.bind(this);
  }

  renderRow(doc) {
  }

  renderObjects() {
    const { objects, remove, save, refetch } = this.props;

    return objects.map(object =>
      this.renderRow({
        key: object._id,
        object,
        remove,
        refetch,
        save
      })
    );
  }

  breadcrumb() {
    return null;
  }

  renderForm({ save }) {
    return null;
  }

  renderContent() {
    return null;
  }

  render() {
    const { totalCount, save, loading } = this.props;

    const trigger = (
      <Button btnStyle="success" size="small" icon="add">
        {this.title}
      </Button>
    );

    const actionBarLeft = (
      <ModalTrigger title={this.title} size={this.size} trigger={trigger}>
        {this.renderForm({ save })}
      </ModalTrigger>
    );

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={this.breadcrumb()} />}
        leftSidebar={<Sidebar />}
        actionBar={<Wrapper.ActionBar right={actionBarLeft} />}
        footer={<Pagination count={totalCount} />}
        transparent={false}
        content={
          <DataWithLoader
            data={this.renderContent()}
            loading={loading}
            count={totalCount}
            emptyText="There is no data."
            emptyImage="/images/robots/robot-05.svg"
          />
        }
      />
    );
  }
}

export default List;
