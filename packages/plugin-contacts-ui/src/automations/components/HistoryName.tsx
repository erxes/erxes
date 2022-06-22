import React from 'react';
import { Link } from 'react-router-dom';
import { renderFullName } from 'coreui/utils';

type Props = {
  triggerType: string;
  target: any;
};

const HistoryName = ({ triggerType, target }: Props) => {
  const type = (triggerType || '').split(':')[1];

  switch (type) {
    case 'company': {
      return (
        <Link target="_blank" to={`/companies/details/${target._id}`}>
          {target.name}
        </Link>
      );
    }

    default:
      return (
        <Link target="_blank" to={`/contacts/details/${target._id}`}>
          {renderFullName(target)}
        </Link>
      );
  }
};

export default HistoryName;
