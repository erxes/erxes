import { Icon } from '@tabler/icons-react';
import { FocusSheet } from 'erxes-ui';
import { useMemo, useState } from 'react';
import { ContactRecordChip } from '../../contacts/components/ContactsRelationField';
import { TRelationEntity } from '../utils';
import {
  ISidePanelNavigator,
  SidePanelNavigatorContext,
  useRecordView,
} from './recordView';

const CONTACT_KINDS: Record<string, 'customer' | 'company'> = {
  'core:customer': 'customer',
  'core:company': 'company',
};

/**
 * The side panel's view of a record, drawn in place: for places the panel
 * cannot reach, such as a modal sheet's side tab. Given several records it
 * lists them first; related records opened inside it stack here, and Back
 * returns through them.
 */
export const EmbeddedRecordPanel = ({
  records,
  label,
  icon,
  onClose,
}: {
  records: TRelationEntity[];
  label: string;
  icon?: Icon;
  onClose: () => void;
}) => {
  const RecordView = useRecordView();
  const single = records.length === 1;
  const [stack, setStack] = useState<TRelationEntity[]>(
    single ? [records[0]] : [],
  );
  const record = stack[stack.length - 1] ?? null;
  // A single record is the root: there is nothing to go back to.
  const canGoBack = stack.length > (single ? 1 : 0);

  const navigator = useMemo<ISidePanelNavigator>(
    () => ({
      record,
      openRecord: (entity, options) =>
        setStack((previous) =>
          options?.replace
            ? [...previous.slice(0, -1), entity]
            : [...previous, entity],
        ),
      back: () => setStack((previous) => previous.slice(0, -1)),
      canGoBack,
      close: onClose,
    }),
    [record, canGoBack, onClose],
  );

  if (!RecordView) {
    return null;
  }

  if (!record) {
    return (
      <>
        <FocusSheet.SideContentHeader label={label} Icon={icon} />
        <div className="flex flex-wrap gap-1 p-3">
          {records.map((entity) => (
            <ContactRecordChip
              key={entity.contentId}
              kind={CONTACT_KINDS[entity.contentType] || 'customer'}
              id={entity.contentId}
              onOpen={() => setStack([entity])}
            />
          ))}
        </div>
      </>
    );
  }

  return (
    <SidePanelNavigatorContext.Provider value={navigator}>
      <RecordView
        key={`${record.contentType}:${record.contentId}`}
        record={record}
        onBack={canGoBack ? navigator.back : undefined}
        onClose={onClose}
      />
    </SidePanelNavigatorContext.Provider>
  );
};
