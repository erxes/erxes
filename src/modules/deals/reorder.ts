// a little function to help us with reordering the result
const reorder = (list: any[], startIndex: number, endIndex: number): any[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

export default reorder;

export const reorderDealMap = ({ dealMap, source, destination }) => {
  const current = [...dealMap[source.droppableId]];
  const next = [...dealMap[destination.droppableId]];
  const target = current[source.index];

  // moving to same list
  if (source.droppableId === destination.droppableId) {
    const reordered = reorder(current, source.index, destination.index);
    const updatedDealMap = {
      ...dealMap,
      [source.droppableId]: reordered
    };
    return {
      dealMap: updatedDealMap
    };
  }

  // moving to different list

  // remove from original
  current.splice(source.index, 1);
  // insert into next
  next.splice(destination.index, 0, target);

  const result = {
    ...dealMap,
    [source.droppableId]: current,
    [destination.droppableId]: next
  };

  return {
    dealMap: result
  };
};
