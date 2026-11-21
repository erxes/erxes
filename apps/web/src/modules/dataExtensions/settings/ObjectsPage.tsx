import { IconBox, IconPlus } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Button, Empty, PageContainer, ScrollArea } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QueryState } from '~/components/QueryState';
import { paths } from '~/lib/paths';
import { objectsQuery } from '../dataQueries';
import { DataModelHeader } from './DataModelHeader';
import { ObjectDialog } from './ObjectDialog';
import { ObjectRow } from './ObjectRow';

const NoObjects = ({ onAdd }: { onAdd: () => void }) => {
  const { t } = useTranslation('data', { keyPrefix: 'objects' });

  return (
    <Empty>
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconBox />
        </Empty.Media>
        <Empty.Title>{t('empty', 'No objects yet')}</Empty.Title>
        <Empty.Description>
          {t(
            'empty-description',
            'Keep records erxes has no place for, such as projects, contracts or vehicles, each with its own fields.',
          )}
        </Empty.Description>
      </Empty.Header>
      <Button onClick={onAdd}>
        <IconPlus />
        {t('add', 'Add object')}
      </Button>
    </Empty>
  );
};

/** Settings › Data model › Objects: the custom objects, active then archived. */
export const ObjectsPage = () => {
  const { t } = useTranslation('data', { keyPrefix: 'objects' });
  const [adding, setAdding] = useState(false);
  const active = useQuery(objectsQuery());
  const archived = useQuery(objectsQuery(true));

  return (
    <PageContainer>
      <DataModelHeader
        crumbs={[{ label: t('title', 'Objects'), to: paths.settings.dataObjects }]}
        actions={
          <Button onClick={() => setAdding(true)}>
            <IconPlus />
            {t('add', 'Add object')}
          </Button>
        }
      />
      <ScrollArea className="flex-1">
        <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
          <QueryState
            query={active}
            isEmpty={({ data }) => !data.length}
            empty={<NoObjects onAdd={() => setAdding(true)} />}
          >
            {({ data }) => (
              <ul className="flex flex-col gap-2">
                {data.map((object) => (
                  <ObjectRow key={object.id} object={object} />
                ))}
              </ul>
            )}
          </QueryState>
          <QueryState query={archived} isEmpty={({ data }) => !data.length}>
            {({ data }) => (
              <section className="flex flex-col gap-2">
                <h2 className="text-sm font-semibold text-muted-foreground">
                  {t('archived-title', 'Archived')}
                </h2>
                <ul className="flex flex-col gap-2">
                  {data.map((object) => (
                    <ObjectRow key={object.id} object={object} />
                  ))}
                </ul>
              </section>
            )}
          </QueryState>
        </div>
      </ScrollArea>
      <ObjectDialog open={adding} onOpenChange={setAdding} />
    </PageContainer>
  );
};
