import React from 'react';

// const DELETE = gql``;

type Props = {
  permits: any[];
};

const PermitList: React.FC<Props> = ({ permits }) => {
  return (
    <div>
      <ul>
        {permits.map(p => {
          return (
            <li>
              {p.category.name}
              <button type="button">Remove</button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PermitList;
