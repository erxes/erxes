import {
  Button,
  ControlLabel,
  FormControl,
  Icon,
  Label,
  ModalTrigger,
  Tip,
  __
} from '@erxes/ui/src';
import moment from 'moment';
import React from 'react';
import { Badge, FormContainer } from '../../styles';
import { DetailPopOver } from '../common/utils';
import Detail from '../containers/Detail';

type Props = {
  item: any;
  selecteAssessmentIds: string[];
  handleSelect: (id: string) => void;
  queryParams: any;
  history: any;
};

class Row extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  renderPopOver(title, contents, group) {
    return (
      <DetailPopOver title={title} icon="downarrow-2" withoutPopoverTitle>
        <FormContainer column>
          {group && (
            <ControlLabel>{`Group Name: ${group?.name || ''}`}</ControlLabel>
          )}
          <FormContainer gapBetween={5}>
            {(contents || []).map(item => (
              <Label key={item?._id}>{__(item?.name)}</Label>
            ))}
          </FormContainer>
        </FormContainer>
      </DetailPopOver>
    );
  }

  render() {
    const {
      item,
      selecteAssessmentIds,
      handleSelect,
      queryParams,
      history
    } = this.props;

    const renderDetail = item => {
      const content = () => {
        return (
          <Detail
            riskAssessment={item}
            queryParams={queryParams}
            history={history}
          />
        );
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

    const onclick = e => {
      e.stopPropagation();
    };

    return (
      <tr key={item?._id}>
        <td onClick={onclick}>
          <FormControl
            componentClass="checkbox"
            checked={selecteAssessmentIds.includes(item?._id)}
            onChange={() => handleSelect(item?._id)}
          />
        </td>
        <td>{__(item?.cardType)}</td>
        <td>{__(item?.card?.name)}</td>
        <td>
          {this.renderPopOver('Indicators', item?.riskIndicators, item.group)}
        </td>
        <td>{item?.branch?.title || '-'}</td>
        <td>{item?.department?.title || '-'}</td>
        <td>{item?.operation?.name || '-'}</td>
        <td>
          <Badge color={item?.statusColor || ''}>{__(item.status)}</Badge>
        </td>
        <td>
          {item?.status !== 'In Progress'
            ? __(item?.resultScore?.toString() || '')
            : '-'}
        </td>
        <td>
          {item?.createdAt ? moment(item?.createdAt).format('ll HH:mm') : '-'}
        </td>
        <td>
          {item?.closedAt ? moment(item?.closedAt).format('ll HH:mm') : '-'}
        </td>
        <td>{renderDetail(item)}</td>
      </tr>
    );
  }
}

export default Row;
