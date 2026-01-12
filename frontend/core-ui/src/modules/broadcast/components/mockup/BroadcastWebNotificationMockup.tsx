import { IconBellRinging, IconMenuDeep, IconSearch } from '@tabler/icons-react';
import { useFormContext } from 'react-hook-form';

export const BroadcastWebNotificationMockup = () => {
  const { watch } = useFormContext();

  const title = watch('notification.title');
  const content = watch('notification.content');

  return (
    <div className="h-full relative flex items-center justify-center select-none">
      <div className="flex flex-col h-10/12 w-10/12 rounded-2xl border-4 border-[#d9d9d9]">
        <div className="flex justify-between items-center px-15 py-5">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">erxes</span>
            <span className="text-[#d9d9d9]"> | </span>
            <div className="w-18 h-3 bg-[#d9d9d9] rounded" />
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <IconBellRinging className="h-5 w-5 text-primary" />

              <div className="absolute top-8 -right-15">
                <div className="h-full w-[350px] bg-[#d9d9d9]/30">
                  <div className="mx-auto rounded-md bg-white shadow-sm">
                    <div className="flex items-center gap-2 border-b px-4 py-3">
                      <IconBellRinging className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">
                        In-app notification
                      </span>
                    </div>

                    <div className="px-4 py-3 flex gap-3 items-center">
                      <svg
                        viewBox="0 0 23 33"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-primary shrink-0"
                      >
                        <path
                          d="M12.6796 16.7509C16.1909 11.598 19.4964 6.1423 22.4233 0.5C19.092 4.26153 15.1649 9.73484 11.5688 15.1003C9.66263 12.3476 7.38208 9.39684 4.76955 6.63271C7.3583 11.4228 8.66767 14.0594 10.459 16.7696C5.01156 25.0008 0.57666 32.5 0.57666 32.5C4.31137 28.1879 8.03367 23.4404 11.5688 18.3714C13.084 20.4647 15.0439 22.8349 18.1756 26.3911C18.1694 26.386 16.2147 22.1278 12.6796 16.7509Z"
                          fill="currentColor"
                        />
                      </svg>
                      <div>
                        <div className="mb-1 text-sm font-semibold">
                          {title || 'Notification title'}
                        </div>

                        <div className="text-sm text-muted-foreground whitespace-pre-line">
                          {content || 'Notification content will appear here'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-5 h-5 bg-[#d9d9d9] rounded-full" />
            <IconMenuDeep className="h-5 w-5 text-gray-300 -scale-x-100" />
          </div>
        </div>

        <div className="flex flex-col gap-2 items-center pt-5 pb-10 border-b-2 rounded-b-2xl">
          <div className="flex gap-3">
            <div className="w-16 h-4 bg-[#d9d9d9] rounded" />
            <div className="w-24 h-4 bg-[#d9d9d9] rounded" />
            <div className="w-10 h-4 bg-[#d9d9d9] rounded" />
            <div className="w-12 h-4 bg-[#d9d9d9] rounded" />
          </div>

          <div className="flex gap-3">
            <div className="w-8 h-4 bg-[#d9d9d9] rounded" />
            <div className="w-16 h-4 bg-[#d9d9d9] rounded" />
            <div className="w-14 h-4 bg-[#d9d9d9] rounded" />
          </div>

          <div className="mt-3 w-[300px] py-1 px-2 bg-[#d9d9d9] rounded-3xl flex items-center">
            <IconSearch className="text-white w-5 h-5" />
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-10 px-15 overflow-hidden">
          <div className="flex flex-col gap-2">
            <div className="w-16 h-4 bg-[#d9d9d9] rounded" />
            <div className="flex gap-3">
              <div className="w-24 h-4 bg-[#d9d9d9] rounded" />
              <div className="w-18 h-4 bg-[#d9d9d9] rounded" />
              <div className="w-20 h-4 bg-[#d9d9d9] rounded" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-5">
            <div className="w-full h-30 bg-[#d9d9d9] rounded" />
            <div className="w-full h-30 bg-[#d9d9d9] rounded" />
            <div className="w-full h-30 bg-[#d9d9d9] rounded" />
          </div>

          <div className="grid grid-cols-3 gap-3 mt-5">
            <div className="w-full h-30 bg-[#d9d9d9] rounded" />
            <div className="w-full h-30 bg-[#d9d9d9] rounded" />
            <div className="w-full h-30 bg-[#d9d9d9] rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};
