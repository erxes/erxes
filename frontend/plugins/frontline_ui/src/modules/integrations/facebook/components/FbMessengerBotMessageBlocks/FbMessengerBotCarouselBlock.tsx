import { TBotData } from '@/integrations/facebook/types/FacebookTypes';
import { Button, readImage } from 'erxes-ui';

type TBotCarouselBlockData = Extract<TBotData, { type: 'carousel' }>;

export const FbMessengerBotCarouselBlock = ({
  data,
}: {
  data: TBotCarouselBlockData;
}) => {
  return (
    <div className="flex snap-x gap-3 overflow-x-auto pb-1">
      {data.elements.map((element, index) => (
        <div
          key={`${element.title}-${index}`}
          className="w-[260px] min-w-[260px] snap-start overflow-hidden rounded-xl border bg-background"
        >
          {!!element.picture && (
            <img
              src={readImage(element.picture)}
              alt={element.title}
              className="h-36 w-full object-cover"
            />
          )}

          <div className="space-y-3 p-3">
            <div className="space-y-1">
              <p className="text-sm font-medium">{element.title}</p>
              {!!element.subtitle && (
                <p className="text-xs text-muted-foreground">
                  {element.subtitle}
                </p>
              )}
            </div>

            {!!element.buttons?.length && (
              <div className="flex flex-col gap-2">
                {element.buttons.map((button, buttonIndex) => (
                  <Button
                    key={`${button.title}-${buttonIndex}`}
                    type="button"
                    variant="outline"
                    className="h-8 justify-center text-xs"
                    disabled
                  >
                    {button.title}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
