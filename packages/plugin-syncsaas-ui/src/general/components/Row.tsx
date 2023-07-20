import { Button, Icon, ModalTrigger, Tip } from '@erxes/ui/src';
import moment from 'moment';
import React from 'react';
import Form from '../containers/Form';
type Props = {
  queryParams: any;
  item: any;
  remove: (_id: string) => void;
};

class Row extends React.Component<Props> {
  constructor(props: any) {
    super(props);
  }

  render() {
    const { item, remove, queryParams } = this.props;

    const handleRemove = () => {
      remove(item._id);
    };

    const onclick = e => {
      e.stopPropagation();
    };

    const trigger = (
      <tr>
        <td>{item?.name || ''}</td>
        <td>{item?.subdomain || ''}</td>
        <td>{moment(item?.startDate).format('ll') || '-'}</td>
        <td>{moment(item?.expireDate).format('ll') || '-'}</td>
        <td onClick={onclick}>
          {' '}
          <Button btnStyle="link" onClick={handleRemove}>
            <Tip placement="bottom" text="Remove Sync">
              <Icon icon="cancel-1" />
            </Tip>
          </Button>
        </td>
      </tr>
    );

    const content = props => {
      const updatedProps = {
        ...props,
        queryParams,
        sync: item
      };

      return <Form {...updatedProps} />;
    };

    return (
      <ModalTrigger
        title="Edit Synced Saas"
        content={content}
        trigger={trigger}
      />
    );
  }
}

export default Row;
