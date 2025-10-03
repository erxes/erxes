import { useFacebookPages } from '@/integrations/facebook/hooks/useFacebookPages';
import { selectedFacebookPageAtom } from '@/integrations/facebook/states/facebookStates';
import { cn, Command, Input, RadioGroup, Spinner } from 'erxes-ui';
import { useAtom } from 'jotai';
export const FacebookBotPagesStep = () => {
  const [selectedPage, setSelectedPage] = useAtom(selectedFacebookPageAtom);

  const { facebookGetPages, loading } = useFacebookPages();

  return (
    <div className="flex-1 overflow-hidden p-4 pt-0">
      <Command>
        <div className="p-1">
          <Command.Primitive.Input asChild>
            <Input placeholder="Search for a page" />
          </Command.Primitive.Input>
        </div>
        <div className="flex justify-between items-center px-1 py-2">
          <div className="text-sm text-muted-foreground">
            {facebookGetPages.length} pages found
          </div>
        </div>
        <RadioGroup
          value={selectedPage}
          onValueChange={(value) =>
            setSelectedPage(value === selectedPage ? undefined : value)
          }
        >
          <Command.List>
            <FacebookBotPagesStepContent
              loading={loading}
              facebookGetPages={facebookGetPages}
            />
          </Command.List>
        </RadioGroup>
      </Command>
    </div>
  );
};

const FacebookBotPagesStepContent = ({
  loading,
  facebookGetPages,
}: {
  loading: boolean;
  facebookGetPages: {
    id: string;
    name: string;
    isUsed: boolean;
  }[];
}) => {
  const [selectedPage, setSelectedPage] = useAtom(selectedFacebookPageAtom);

  if (loading) {
    return <Spinner />;
  }

  return facebookGetPages.map((page) => (
    <Command.Item
      key={page.id}
      value={page.name}
      onSelect={() =>
        setSelectedPage(selectedPage === page.id ? undefined : page.id)
      }
      className={cn(
        'gap-3 border-t last-of-type:border-b rounded-none h-10 px-3',
        selectedPage === page.id && 'text-primary',
      )}
    >
      <RadioGroup.Item value={page.id} className="bg-background" />
      <div className="font-semibold">{page.name}</div>
    </Command.Item>
  ));
};
