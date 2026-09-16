import { ScrollArea } from 'erxes-ui';
import { FieldsInDetail, mutateFunction } from 'ui-modules';

const EMPTY_PROPERTIES_DATA: Record<string, unknown> = {};

export const PropertiesSidePanel = ({
  contentType,
  contentId,
  propertiesData,
  mutateHook,
}: {
  contentType: 'operation:task' | 'operation:project';
  contentId: string;
  propertiesData?: Record<string, unknown>;
  mutateHook: () => { mutate: mutateFunction; loading: boolean };
}) => {
  return (
    <ScrollArea className="flex-auto" viewportClassName="[&>div]:h-full">
      <FieldsInDetail
        className="h-full gap-0 [&>div]:h-full [&>div]:rounded-none [&>div]:bg-transparent [&>div]:p-0 [&>div>div:first-child]:hidden [&>div>div:last-child]:rounded-none [&>div>div:last-child]:bg-transparent [&>div>div:last-child]:p-0 [&>div>div:last-child]:shadow-none [&_.grid-cols-2]:grid-cols-1"
        fieldContentType={contentType}
        id={contentId}
        propertiesData={propertiesData ?? EMPTY_PROPERTIES_DATA}
        mutateHook={mutateHook}
      />
    </ScrollArea>
  );
};
