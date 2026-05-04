import {
  selectedInstagramAccountAtom,
  selectedInstagramPageAtom,
} from '@/integrations/instagram/states/instagramStates';
import { cn, Command, Input, RadioGroup, Spinner } from 'erxes-ui';
import { useAtom, useAtomValue } from 'jotai';
import { useInstagramPages } from '@/integrations/instagram/hooks/useInstagramPages';

export const InstagramBotPagesStep = () => {
  const [selectedPage, setSelectedPage] = useAtom(selectedInstagramPageAtom);
  const selectedAccountId = useAtomValue(selectedInstagramAccountAtom);

  const { instagramGetPages, loading } = useInstagramPages({
    kind: 'instagram',
    accountId: selectedAccountId,
  });

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
            {instagramGetPages.length} pages found
          </div>
        </div>
        <RadioGroup
          value={selectedPage}
          onValueChange={(value) =>
            setSelectedPage(value === selectedPage ? undefined : value)
          }
        >
          <Command.List>
            <InstagramBotPagesStepContent
              loading={loading}
              instagramGetPages={instagramGetPages}
            />
          </Command.List>
        </RadioGroup>
      </Command>
    </div>
  );
};

const InstagramBotPagesStepContent = ({
  loading,
  instagramGetPages,
}: {
  loading: boolean;
  instagramGetPages: {
    id: string;
    name: string;
    isUsed: boolean;
  }[];
}) => {
  const [selectedPage, setSelectedPage] = useAtom(selectedInstagramPageAtom);

  if (loading) {
    return <Spinner />;
  }

  return instagramGetPages.map((page) => (
    <Command.Item
      key={page.id}
      value={page.name}
      onSelect={() =>
        setSelectedPage(selectedPage === page.id ? undefined : page.id)
      }
      className={cn(
        'gap-3 border-t last-of-type:border-b rounded-none h-10 px-3',
        selectedPage === page.id && 'text-pink-600',
      )}
    >
      <RadioGroup.Item value={page.id} className="bg-background" />
      <div className="font-semibold">{page.name}</div>
    </Command.Item>
  ));
};
