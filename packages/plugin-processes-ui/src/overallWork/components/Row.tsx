import _ from 'lodash';
import React from 'react';
import { FinanceAmount } from '../../styles';
import { IOverallWork } from '../types';
import queryString from 'query-string';

type Props = {
  work: IOverallWork;
  history: any;
  queryParams: any;
};

class OverallWorkRow extends React.Component<Props> {
  displayLocInfo(obj) {
    if (!obj) {
      return '';
    }
    return `${obj.code} - ${obj.title}`;
  }

  displayWithNameInfo(obj) {
    if (!obj) {
      return '';
    }
    return `${obj.code} - ${obj.name}`;
  }
  displayValue(work, name) {
    const value = _.get(work, name);
    return <FinanceAmount>{(value || 0).toLocaleString()}</FinanceAmount>;
  }

  render() {
    const { work, history, queryParams } = this.props;
    const onTrClick = () => {
      let typeFilter: any = { jobReferId: work.key.typeId };
      if (!['job', 'end'].includes(work.type)) {
        typeFilter = { productIds: [work.key.typeId] };
      }
      work.type = history.push(
        `/processes/overallWorkDetail?${queryString.stringify({
          ...queryParams,
          ...work.key,
          ...typeFilter
        })}`
      );
    };

    const onClick = e => {
      e.stopPropagation();
    };

    return (
      <tr onClick={onTrClick} key={Math.random()}>
        <td>{work.type}</td>
        <td>{this.displayWithNameInfo(work.jobRefer)}</td>
        <td>{this.displayWithNameInfo(work.product)}</td>
        <td key={'receivableAmount'}>{this.displayValue(work, 'count')}</td>
        <td>{this.displayLocInfo(work.inBranch)}</td>
        <td>{this.displayLocInfo(work.inDepartment)}</td>
        <td>{this.displayLocInfo(work.outBranch)}</td>
        <td>{this.displayLocInfo(work.outDepartment)}</td>
        <td key={'actions'} onClick={onClick}></td>
      </tr>
    );
  }
}

export default OverallWorkRow;
