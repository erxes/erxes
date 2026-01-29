import { IconBuilding, IconLabelFilled, IconUser } from '@tabler/icons-react';
import type { ColumnDef } from '@tanstack/react-table';
import {
  Avatar,
  readImage,
  RecordTable,
  RecordTableInlineCell,
  TextOverflowTooltip,
  useQueryState,
} from 'erxes-ui';
import { TCompany } from '@/contacts/types/companyType';
import { ContactsHotKeyScope } from '@/contacts/types/ContactsHotKeyScope';
import {
  CompanyEmails,
  CompanyName,
  CompanyPhones,
  SelectMember,
  TagsSelect,
  useCompaniesEdit,
} from 'ui-modules';
import { useSetAtom } from 'jotai';
import { renderingCompanyDetailAtom } from '@/contacts/states/companyDetailStates';
import clsx from 'clsx';
import { TFunction } from 'i18next';
import { companyMoreColumn } from './CompanyMoreColumn';

export const companyColumns: (t: TFunction) => ColumnDef<TCompany>[] = (t) => {
  return [
    companyMoreColumn,
    RecordTable.checkboxColumn as ColumnDef<TCompany>,
    {
      id: 'avatar',
      accessorKey: 'avatar',
      header: () => <RecordTable.InlineHead icon={IconBuilding} label="" />,
      cell: ({ cell }) => {
        const { primaryName, primaryEmail, primaryPhone } = cell.row.original;
        return (
          <div className="flex items-center justify-center h-8">
            <Avatar>
              <Avatar.Image src={readImage(cell.getValue() as string)} />
              <Avatar.Fallback>
                {primaryName?.charAt(0) ||
                  primaryEmail?.charAt(0) ||
                  primaryPhone?.charAt(0) ||
                  '-'}
              </Avatar.Fallback>
            </Avatar>
          </div>
        );
      },
      size: 34,
    },
    {
      id: 'primaryName',
      accessorKey: 'primaryName',
      header: () => (
        <RecordTable.InlineHead icon={IconLabelFilled} label={t('name')} />
      ),
      cell: ({ cell }) => {
        const { primaryName, _id } = cell.row.original;
        const setRenderingCompanyDetail = useSetAtom(
          renderingCompanyDetailAtom,
        );
        const [, setCompanyDetail] = useQueryState('companyId');
        return (
          <CompanyName
            primaryName={primaryName}
            _id={_id}
            scope={clsx(ContactsHotKeyScope.CompaniesPage, _id, 'Name')}
          >
            <RecordTableInlineCell.Trigger>
              <RecordTableInlineCell.Anchor
                onClick={() => {
                  setRenderingCompanyDetail(true);
                  setCompanyDetail(cell.row.original._id);
                }}
              >
                {primaryName}
              </RecordTableInlineCell.Anchor>
            </RecordTableInlineCell.Trigger>
          </CompanyName>
        );
      },
      size: 250,
    },
    {
      id: 'emails',
      accessorKey: 'primaryEmail',
      header: () => <RecordTable.InlineHead label={t('emails')} />,
      cell: ({ cell }) => {
        const { primaryEmail, _id, emails, emailValidationStatus } =
          cell.row.original;

        return (
          <CompanyEmails
            primaryEmail={primaryEmail || ''}
            _id={_id}
            scope={ContactsHotKeyScope.CompaniesPage + '.' + _id + '.Emails'}
            emailValidationStatus={emailValidationStatus}
            emails={emails || []}
            Trigger={RecordTableInlineCell.Trigger}
          />
        );
      },
    },
    {
      id: 'phones',
      accessorKey: 'primaryPhone',
      header: () => <RecordTable.InlineHead label={t('phones')} />,
      cell: ({ cell }) => {
        const { _id, phones, phoneValidationStatus, primaryPhone } =
          cell.row.original;

        return (
          <CompanyPhones
            _id={_id}
            primaryPhone={primaryPhone || ''}
            phones={phones || []}
            phoneValidationStatus={phoneValidationStatus}
            scope={ContactsHotKeyScope.CompaniesPage + '.' + _id + '.Phones'}
            Trigger={RecordTableInlineCell.Trigger}
          />
        );
      },
    },
    {
      id: 'owner',
      accessorKey: 'ownerId',
      header: () => <RecordTable.InlineHead label={t('owner')} />,
      cell: ({ cell }) => {
        const { companiesEdit } = useCompaniesEdit();
        return (
          <SelectMember.InlineCell
            scope={clsx(
              ContactsHotKeyScope.CompaniesPage,
              cell.row.original._id,
              'Owner',
            )}
            value={cell.getValue() as string}
            onValueChange={(value) =>
              companiesEdit({
                variables: {
                  _id: cell.row.original._id,
                  ownerId: value as string,
                },
              })
            }
          />
        );
      },
      size: 200,
    },
    {
      id: 'plan',
      accessorKey: 'plan',
      header: () => <RecordTable.InlineHead label={t('plan')} />,
      cell: ({ cell }) => {
        return (
          <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
            <TextOverflowTooltip value={cell.getValue() as string} />
          </RecordTableInlineCell>
        );
      },
    },
    {
      id: 'tagIds',
      accessorKey: 'tagIds',
      header: () => <RecordTable.InlineHead label={t('tags')} />,
      cell: ({ cell }) => {
        return (
          <TagsSelect.InlineCell
            type="core:company"
            mode="multiple"
            value={cell.row.original.tagIds}
            targetIds={[cell.row.original._id]}
            options={(newSelectedTagIds) => ({
              update: (cache) => {
                cache.modify({
                  id: cache.identify({
                    __typename: 'Company',
                    _id: cell.row.original._id,
                  }),
                  fields: {
                    tagIds: () => newSelectedTagIds,
                  },
                });
              },
            })}
          />
        );
      },
      size: 300,
    },

    {
      id: 'lastSeenAt',
      accessorKey: 'lastSeenAt',
      header: () => <RecordTable.InlineHead label={t('last-seen')} />,
      cell: ({ cell }) => {
        return (
          <RecordTableInlineCell>
            <TextOverflowTooltip value={cell.getValue() as string} />
          </RecordTableInlineCell>
        );
      },
    },
    {
      id: 'profileScore',
      accessorKey: 'score',
      header: () => (
        <RecordTable.InlineHead icon={IconUser} label={t('profile-score')} />
      ),
      cell: ({ cell }) => (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      ),
    },
  ];
};
