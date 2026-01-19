import { IItem } from '~/modules/deals/types/deals';

const footerInfo = (item: IItem) => {
  if (!item.isWatched && !item.number) {
    return 'Created at';
  }

  return (
    <>
      {item.isWatched}
      {item.number}
    </>
  );
};

export const DealsCount = (props: { item: IItem }) => {
  const { item } = props;
  return <div className="opacity-50">{footerInfo(item)}</div>;
};
