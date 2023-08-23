import { ICustomer } from '@erxes/ui-contacts/src/customers/types';
import {
  FieldStyle,
  SidebarCounter,
  SidebarList,
  Table,
  __
} from '@erxes/ui/src';
import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import _ from 'lodash';
import * as moment from 'moment';
import React from 'react';
import { FinanceAmount, FlexRow } from '../../styles';
import { IPos } from '../../types';
import { ICover } from '../types';

type Props = {
  onChangeNote: (_id: string, note: string) => void;
  cover: ICover;
  pos: IPos;
};

type State = {
  note: string;
};

class CoverDetail extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { cover, pos } = this.props;

    this.state = {
      note: cover.note || ''
    };
  }

  displayValue(cover, name) {
    const value = _.get(cover, name);
    return <FinanceAmount>{(value || 0).toLocaleString()}</FinanceAmount>;
  }

  renderRow(label, value) {
    return (
      <li>
        <FlexRow>
          <FieldStyle>{__(`${label}`)}:</FieldStyle>
          <SidebarCounter>{value || '-'}</SidebarCounter>
        </FlexRow>
      </li>
    );
  }

  renderEditRow(label, key) {
    const value = this.state[key];
    const onChangeValue = e => {
      this.setState({ [key]: Number(e.target.value) } as any);
    };
    return (
      <li>
        <FlexRow>
          <FieldStyle>{__(`${label}`)}:</FieldStyle>
          <FormControl type="number" onChange={onChangeValue} value={value} />
        </FlexRow>
      </li>
    );
  }

  onChangeNote = e => {
    const value = e.target.value;
    this.setState({
      note: value
    });
  };

  save = () => {
    const { cover } = this.props;
    const { note } = cover;

    this.props.onChangeNote(this.props.cover._id || '', note || '');
  };

  generateLabel = customer => {
    const { firstName, primaryEmail, primaryPhone, lastName } =
      customer || ({} as ICustomer);

    let value = firstName ? firstName.toUpperCase() : '';

    if (lastName) {
      value = `${value} ${lastName}`;
    }
    if (primaryPhone) {
      value = `${value} (${primaryPhone})`;
    }
    if (primaryEmail) {
      value = `${value} /${primaryEmail}/`;
    }

    return value;
  };

  renderDetail(det) {
    if (!det) {
      return '';
    }

    if (typeof det === 'object') {
      return JSON.stringify(det);
    }

    return (det || '').toString();
  }

  render() {
    const { cover } = this.props;

    return (
      <SidebarList>
        {this.renderRow(
          'Begin Date',
          moment(cover.beginDate).format('YYYY-MM-DD HH:mm')
        )}
        {this.renderRow(
          'End Date',
          moment(cover.endDate).format('YYYY-MM-DD HH:mm')
        )}
        {this.renderRow('User', cover.user.email)}
        {this.renderRow('POS', cover.posName)}

        {this.renderRow(
          'Total Amount',
          this.displayValue(cover, 'totalAmount')
        )}

        {this.renderRow('Description', cover.description)}

        <Table whiteSpace="nowrap" bordered={true} hover={true}>
          <thead>
            <tr>
              <th colSpan={3}>{__('Type')}</th>
              <th>{__('Summary')}</th>
              <th>{__('Detail')}</th>
            </tr>
          </thead>
          <tbody id="coverDetails">
            {(cover.details || []).map(detail => (
              <>
                <tr key={detail._id}>
                  <td colSpan={3}>{detail.paidType}</td>
                  <td>
                    {(detail.paidSummary || []).reduce(
                      (sum, cur) => sum + cur.amount,
                      0
                    )}
                  </td>
                  <td>{this.renderDetail(detail.paidDetail)}</td>
                </tr>
                <tr key={`${detail._id}_head`}>
                  <td></td>
                  <td>kind</td>
                  <td>kindOfVal</td>
                  <td>Value</td>
                  <td>amount</td>
                </tr>
                {(detail.paidSummary || []).map(s => (
                  <tr key={`${detail._id}_${s._id || Math.random()}`}>
                    <td></td>
                    <td>{s.kind}</td>
                    <td>{s.kindOfVal}</td>
                    <td>{s.value}</td>
                    <td>{s.amount}</td>
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </Table>

        <Button btnStyle="success" size="small" onClick={this.save} icon="edit">
          Save Note
        </Button>
      </SidebarList>
    );
  }
}

export default CoverDetail;
