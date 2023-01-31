import { Button, Tip, Icon, ModalTrigger, __, Label } from '@erxes/ui/src';
import moment from 'moment';
import React from 'react';
import { Badge, FormContainer } from '../../styles';
import { DetailPopOver } from '../common/utils';
import Detail from '../containers/Detail';

type Props = {
  item: any;
};

class Row extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  renderPopOver(title, contents) {
    let field = '';

    if (['Branches', 'Departments'].includes(title)) {
      field = 'title';
    }
    if (['Operations', 'Indicators'].includes(title)) {
      field = 'name';
    }

    return (
      <DetailPopOver title={title} icon="downarrow-2" withoutPopoverTitle>
        <FormContainer gapBetween={5}>
          {(contents || []).map(item => (
            <Label key={item._id}>{__(item[field])}</Label>
          ))}
        </FormContainer>
      </DetailPopOver>
    );
  }

  render() {
    const { item } = this.props;

    const renderFormSubmitHistory = item => {
      const content = () => {
        return <Detail riskAssessment={item} />;
      };

      const trigger = (
        <Button btnStyle="link" style={{ padding: '5px' }}>
          <Tip placement="bottom" text="See detail risk assessment">
            <Icon icon="file-search-alt" />
          </Tip>
        </Button>
      );

      return (
        <ModalTrigger
          title="Risk assessment detail"
          content={content}
          trigger={trigger}
          size="xl"
        />
      );
    };

    return (
      <tr key={item._id}>
        <td>{__(item?.cardType)}</td>
        <td>{__(item?.card?.name)}</td>
        <td>{this.renderPopOver('Indicators', item?.riskIndicators)}</td>
        <td>{this.renderPopOver('Branches', item?.branches)}</td>
        <td>{this.renderPopOver('Departments', item?.departments)}</td>
        <td>{this.renderPopOver('Operations', item?.operations)}</td>
        <td>
          <Badge color={item.statusColor}>{__(item.status)}</Badge>
        </td>
        <td>
          {item.status !== 'In Progress'
            ? __(item.resultScore?.toString() || '')
            : '-'}
        </td>
        <td>
          {item?.createdAt ? moment(item.createdAt).format('ll HH:mm') : '-'}
        </td>
        <td>
          {item?.closedAt ? moment(item.closedAt).format('ll HH:mm') : '-'}
        </td>
        <td>{renderFormSubmitHistory(item)}</td>
      </tr>
    );
  }
}

export default Row;
