import type { ExtendableRecordType } from '@erxes/core-contract';
import { IconLinkPlus, IconPlus } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Button, PageContainer, ScrollArea, Sidebar } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useParams } from 'react-router-dom';
import { QueryState } from '~/components/QueryState';
import { paths } from '~/lib/paths';
import { pluginName, usePluginText } from '~/modules/plugins/pluginText';
import { recordTypesQuery } from '../dataQueries';
import { DataModelHeader } from './DataModelHeader';
import { FieldSheet } from './field/FieldSheet';
import { FieldList } from './FieldList';
import { RelationDialog } from './RelationDialog';

/** Who keeps a record type: core, the organisation (custom objects) or a plugin. */
const ownerOf = (type: ExtendableRecordType) => type.plugin ?? type.type.split('.')[0] ?? 'core';

/** The record types fields can go on, a group per owner. */
const RecordTypeSidebar = ({
  types,
  current,
}: {
  types: ExtendableRecordType[];
  current: string;
}) => {
  const { t } = useTranslation('data', { keyPrefix: 'fields' });
  const text = usePluginText();
  const owners = [...new Set(types.map(ownerOf))];

  const ownerLabel = (owner: string) => {
    if (owner === 'core') return t('core', 'Core');

    return owner === 'custom' ? t('custom', 'Custom objects') : pluginName(text, owner);
  };

  return (
    <Sidebar.Panel className="flex-none" label={t('record-types', 'Record types')}>
      {owners.map((owner) => (
        <Sidebar.Group key={owner}>
          <Sidebar.GroupLabel>{ownerLabel(owner)}</Sidebar.GroupLabel>
          <Sidebar.GroupContent>
            <Sidebar.Menu>
              {types
                .filter((type) => ownerOf(type) === owner)
                .map((type) => (
                  <Sidebar.MenuItem key={type.type}>
                    <Sidebar.MenuButton
                      isActive={type.type === current}
                      render={<Link to={paths.settings.dataFieldsOf(type.type)} />}
                    >
                      {type.label}
                    </Sidebar.MenuButton>
                  </Sidebar.MenuItem>
                ))}
            </Sidebar.Menu>
          </Sidebar.GroupContent>
        </Sidebar.Group>
      ))}
    </Sidebar.Panel>
  );
};

const FieldsOf = ({
  types,
  type,
}: {
  types: ExtendableRecordType[];
  type: ExtendableRecordType;
}) => {
  const { t } = useTranslation('data', { keyPrefix: 'fields' });
  const [adding, setAdding] = useState(false);
  const [relating, setRelating] = useState(false);

  return (
    <div className="flex flex-auto overflow-hidden">
      <RecordTypeSidebar types={types} current={type.type} />
      <div className="flex min-w-0 flex-auto flex-col overflow-hidden">
        <DataModelHeader
          crumbs={[
            { label: t('title', 'Fields'), to: paths.settings.dataFields },
            { label: type.label, to: paths.settings.dataFieldsOf(type.type) },
          ]}
          actions={
            <>
              <Button variant="outline" onClick={() => setRelating(true)}>
                <IconLinkPlus />
                {t('add-relation', 'Add relation')}
              </Button>
              <Button onClick={() => setAdding(true)}>
                <IconPlus />
                {t('add', 'Add field')}
              </Button>
            </>
          }
        />
        <ScrollArea className="flex-auto">
          <FieldList key={type.type} recordType={type.type} />
        </ScrollArea>
      </div>
      <FieldSheet recordType={type.type} open={adding} onOpenChange={setAdding} />
      <RelationDialog recordType={type.type} open={relating} onOpenChange={setRelating} />
    </div>
  );
};

/** Settings › Data model › Fields: a record type's fields, the type picked on the left. */
export const FieldsPage = () => {
  const { recordType } = useParams<{ recordType: string }>();
  const types = useQuery(recordTypesQuery());

  return (
    <PageContainer>
      <QueryState query={types}>
        {({ data }) => {
          const type = data.find((entry) => entry.type === recordType);
          const [first] = data;

          if (type) return <FieldsOf types={data} type={type} />;

          return first ? <Navigate to={paths.settings.dataFieldsOf(first.type)} replace /> : null;
        }}
      </QueryState>
    </PageContainer>
  );
};
