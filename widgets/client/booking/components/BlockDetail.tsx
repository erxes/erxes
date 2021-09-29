import * as React from 'react';
import { IProductCategory } from '../types';
import { BackButton } from './common';
import FilterableList from './common/FilterableList';

type Props = {
  floors: IProductCategory[];
  goToBookings: () => void;
};

function BlockDetail({ floors, goToBookings }: Props) {
  const data = [
    {
      name: 'Parent 1',
      _id: 'parent1',
      parentId: ''
    },
    {
      name: 'child 1-1',
      _id: 'child1-1',
      parentId: 'parent1'
    },
    {
      name: 'child 1-2',
      _id: 'child1-2',
      parentId: 'parent1'
    },
    {
      name: 'child 1-3',
      _id: 'child1-3',
      parentId: 'parent1'
    },
    {
      name: 'grandChild 1-1',
      _id: 'grandChild1-1',
      parentId: 'child1-1'
    }
  ];

  return (
    <div>
      <FilterableList
        treeView={true}
        selectable={false}
        loading={false}
        items={JSON.parse(JSON.stringify(data))}
      />
      {/* {floors.map((floor, index) => {
        return <h1 key={index}>{floor.name}</h1>;
      })} */}
      <BackButton onClickHandler={goToBookings} />
    </div>
  );
}

export default BlockDetail;
