import { Button, Tip, Icon, ModalTrigger, __ } from '@erxes/ui/src';
import moment from 'moment';
import React from 'react';
import { Badge } from '../../styles';
import FormHistory from '../../containers/FormHistory';

type Props = {
  item: any;
};

class Row extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  render() {
    const { item } = this.props;

    const renderFormSubmitHistory = item => {
      const content = () => {
        const updatedProps = {
          cardId: item.cardId || '',
          cardType: item.cardType || '',
          riskAssessmentId: item.riskAssessmentId || ''
        };

        return <FormHistory {...updatedProps} />;
      };

      const trigger = (
        <Button btnStyle="link" style={{ padding: '5px' }}>
          <Tip placement="bottom" text="See form submit history">
            <Icon icon="file-check-alt" />
          </Tip>
        </Button>
      );

      return (
        <ModalTrigger
          title="Form Submit History"
          content={content}
          trigger={trigger}
          size="lg"
        />
      );
    };

    return (
      <tr>
        <td>{__(item.cardType)}</td>
        <td>{__(item?.card?.name)}</td>
        <td>{__(item?.riskAssessment?.name)}</td>
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
        <td>
          {item.status !== 'In Progress' && renderFormSubmitHistory(item)}
        </td>
      </tr>
    );
  }
}

export default Row;
