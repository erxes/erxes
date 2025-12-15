import { IconNote } from '@tabler/icons-react';
import { INTERNAL_NOTES } from '@/deals/graphql/queries/InternalNoteQueries';
import dayjs from 'dayjs';
import { useQuery } from '@apollo/client';

type TimelineBase = {
  _id: string;
  content: string;
  createdAt: string;
  createdUser: {
    details: {
      fullName: string;
      avatar?: string;
    };
  };
};

type ITimelineItem<TExtra = Record<string, unknown>> = TimelineBase & TExtra;

interface IProps {
  contentType: string;
  contentTypeId: string;
}

const ActivityList = ({ contentType, contentTypeId }: IProps) => {
  const { data, loading } = useQuery(INTERNAL_NOTES, {
    variables: { contentType, contentTypeId },
  });

  const timelineItems = [...(data?.internalNotes || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  if (loading) return <div>Loading..</div>;
  return (
    <div className="w-full">
      {timelineItems.map((item: ITimelineItem, index: number) => (
        <div
          key={index}
          className="relative border-l border-gray-300 pl-10 ml-6 space-y-8 min-h-24"
        >
          <div className="flex items-start gap-4 pb-4">
            <div className="absolute -left-5 top-2 bg-white border border-gray-300 rounded-full p-2">
              <IconNote className="text-indigo-500 w-6 h-6" />
            </div>
            <div className="flex flex-col min-h-24 mt-4 w-full">
              <h4 className="text-base text-gray-800">
                <b>{item.createdUser?.details?.fullName || 'User'}</b> added a
                note
              </h4>
              <div className="p-2 bg-gray-100 rounded-md mt-2">
                <span className="text-xs text-gray-500 mb-2 block">
                  {dayjs(item.createdAt).format('YYYY-MM-DD')}
                </span>
                <p className="text-sm">{item.content}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityList;
