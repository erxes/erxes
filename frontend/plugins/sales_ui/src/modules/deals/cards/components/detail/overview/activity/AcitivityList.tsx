import { IconMail, IconUser } from '@tabler/icons-react';

import dayjs from 'dayjs';

const timelineItems = [
  {
    icon: <IconUser className="text-indigo-500 w-6 h-6" />,
    name: 'User user',
    action: 'posted a comment',
    description: 'The user was successfully registered in the system.',
  },
  {
    icon: <IconMail className="text-indigo-500 w-6 h-6" />,
    name: 'User user',
    action: 'verified email',
    description: 'User user verified their email address.',
  },
];

const ActivityList = () => {
  return (
    <div className="w-full">
      {timelineItems.map((item, index) => (
        <div
          key={index}
          className="relative border-l border-gray-300 pl-10 ml-6 space-y-8 min-h-24"
        >
          <div className="flex items-start gap-4 pb-4">
            <div className="absolute -left-5 top-2 bg-white border border-gray-300 rounded-full p-2">
              {item.icon}
            </div>
            <div className="flex flex-col min-h-24 mt-4 w-full">
              <h4 className="text-base text-gray-800">
                <b>{item.name}</b> {item.action}
              </h4>
              <div className="p-2 bg-gray-100 rounded-md mt-2">
                <span className="text-xs text-gray-500 mb-2 block">
                  {dayjs(new Date()).format('YYYY-MM-DD')}
                </span>
                <p className="text-sm">{item.description}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityList;
