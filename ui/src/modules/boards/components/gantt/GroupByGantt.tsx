import { Items } from '../portable';

type Props = {
  items: Items[];
  chartType: string;
};

export default function GanttGroupBy({ chartType, items }: Props) {
  switch (chartType) {
    case 'label': {
      return items.map(item => console.log('test', item));
    }

    default: {
      return items.map(item => console.log('test', item));
    }
  }
}
