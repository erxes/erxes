import { IconBellRinging } from '@tabler/icons-react';
import { useFormContext } from 'react-hook-form';

export const BroadcastMobileNotificationMockup = () => {
  const { watch } = useFormContext();

  const title = watch('notification.title');
  const content = watch('notification.content');

  const renderDate = () => {
    const option: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    };

    return new Date().toLocaleDateString('en-US', option);
  };

  const renderTime = () => {
    const date = new Date();

    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${hours}:${minutes}`;
  };

  return (
    <div className="h-full relative flex justify-center select-none">
      <div className="absolute bottom-0 h-10/12 bg-[#f0f0f0] w-[400px] rounded-t-[70px] border-8 border-b-0 border-[#d9d9d9] p-6">
        <div className="relative h-full flex flex-col items-center">
          <div className="w-[100px] h-[30px] bg-[#d7d7d7] rounded-2xl"></div>

          <div className="pt-10 w-full flex flex-col items-center text-[#d9d9d9] h-full">
            <div className="text-2xl font-semibold text-center w-full">
              {renderDate()}
            </div>

            <div className="w-full text-center font-semibold leading-none text-[clamp(60px,12vw,108px)]">
              {renderTime()}
            </div>
          </div>

          <div className="absolute top-60 w-[450px]">
            <div className="w-full rounded-xl bg-white shadow-lg px-4 py-3">
              <div className="flex items-center gap-4">
                <svg
                  viewBox="0 0 23 33"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-primary"
                >
                  <path
                    d="M12.6796 16.7509C16.1909 11.598 19.4964 6.1423 22.4233 0.5C19.092 4.26153 15.1649 9.73484 11.5688 15.1003C9.66263 12.3476 7.38208 9.39684 4.76955 6.63271C7.3583 11.4228 8.66767 14.0594 10.459 16.7696C5.01156 25.0008 0.57666 32.5 0.57666 32.5C4.31137 28.1879 8.03367 23.4404 11.5688 18.3714C13.084 20.4647 15.0439 22.8349 18.1756 26.3911C18.1694 26.386 16.2147 22.1278 12.6796 16.7509Z"
                    fill="currentColor"
                  />
                </svg>

                <div className="flex-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <IconBellRinging className="h-3 w-3" />
                    Erxes
                    <span className="ml-auto">now</span>
                  </div>

                  <div className="text-sm font-semibold mb-2">
                    {title || 'Notification title'}
                  </div>

                  <div className="text-sm text-muted-foreground line-clamp-3">
                    {content || 'Notification content will appear here'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
