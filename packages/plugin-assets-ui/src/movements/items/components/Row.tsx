import { Button, Icon, ModalTrigger, renderFullName, Tip } from '@erxes/ui/src';
import moment from 'moment';
import React from 'react';
import { IMovementItem } from '../../../common/types';
import Form from '../../containers/Form';

type Props = {
  item: IMovementItem;
  queryParams: any;
};

class Row extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  renderForm({
    assetId,
    movementId,
    trigger,
    modaltText
  }: {
    assetId?: string;
    movementId?: string;
    modaltText: string;
    item?: IMovementItem;
    trigger: React.ReactNode;
  }) {
    const content = props => {
      const updatedProps = {
        ...props,
        assetId,
        movementId,
        queryParams: this.props.queryParams || {}
      };
      return <Form {...updatedProps} />;
    };

    return (
      <ModalTrigger
        content={content}
        title={`${modaltText} Movement`}
        trigger={trigger}
        size="xl"
      />
    );
  }

  render() {
    const { item } = this.props;

    const {
      assetId,
      assetDetail,
      movementId,
      branch,
      department,
      teamMember,
      company,
      customer,
      createdAt
    } = item;

    const editTrigger = (
      <Button btnStyle="link" style={{ padding: 0 }}>
        <Tip text="See detail of movement" placement="bottom">
          <Icon icon="file-edit-alt" />
        </Tip>
      </Button>
    );

    return (
      <tr>
        <td>{assetDetail?.name}</td>
        <td>{(branch && branch?.title) || '-'}</td>
        <td>{(department && department.title) || '-'}</td>
        <td>{(teamMember && teamMember?.details?.fullName) || '-'}</td>
        <td>{(company && company.primaryName) || '-'}</td>
        <td>{(customer && renderFullName(customer)) || '-'}</td>
        <td>{moment(createdAt || '').format('YYYY-MM-DD HH:mm')}</td>
        <td style={{ width: 60 }}>
          {this.renderForm({
            modaltText: 'Edit',
            assetId,
            movementId,
            trigger: editTrigger
          })}
        </td>
      </tr>
    );
  }
}

export default Row;
