import {
  IconBinoculars,
  IconCircleCheck,
  IconClockEdit,
  IconCrane,
  IconGavel,
  IconHelpSquareRounded,
  IconRotateClockwise2,
  IconStopwatch,
  IconTrashX
} from '@tabler/icons-react';
import {
  eachDayOfInterval,
  format,
  isAfter,
  isBefore,
  isSameDay
} from 'date-fns';
import {
  Button,
  DatePicker,
  RecordTable,
  Spinner,
  Tooltip,
  useQueryState
} from 'erxes-ui';

import { useSafeRemainderDetail } from '../hooks/useSafeRemainderDetail';
import { useSafeRemainderDetails } from '../hooks/useSafeRemainderDetails';
import { useSafeRemainderSubmit } from '../hooks/useSafeRemainderSubmit';
import { SAFE_REMAINDER_STATUSES, ISafeRemainder } from '../types/SafeRemainder';
import { adjustDetailTableColumns } from './SafeRemainderDetailColumns';
import { useSafeRemainderRemove } from '../hooks/useSafeRemainderRemove';

export const SafeRemainderDetail = () => {
  // const parentId = useParams().parentId;
  const [id] = useQueryState<string>('id');

  const { safeRemainder, loading } = useSafeRemainderDetail({
    variables: { _id: id },
    skip: !id,
  });

  const { safeRemainderDetails, safeRemainderDetailsCount, loading: detailsLoading, handleFetchMore } = useSafeRemainderDetails({
    variables: { _id: id },
    skip: !id,
  });

  const { submitSafeRemainder } = useSafeRemainderSubmit(id ?? '');
  const { removeSafeRemainder } = useSafeRemainderRemove(id ?? '');

  if (loading || detailsLoading) {
    return <Spinner />;
  }

  if (!id) {
    return;
  }

  const handleSubmit = () => {
    submitSafeRemainder();
  }

  const handleDelete = () => {
    removeSafeRemainder()
  }

  // const renderEvents = () => {
  //   const status = safeRemainder?.status || SAFE_REMAINDER_STATUSES.DRAFT;
  //   switch (status) {
  //     case SAFE_REMAINDER_STATUSES.DRAFT:
  //     case SAFE_REMAINDER_STATUSES.PROCESS:
  //       return (
  //         <>
  //           <Button
  //             onClick={handleRun}
  //           >
  //             <IconCrane />
  //             RUN
  //           </Button>
  //           <Button
  //             variant="secondary"
  //             className="text-destructive"
  //             onClick={handleDelete}
  //           >
  //             <IconTrashX />
  //             Delete
  //           </Button>
  //         </>
  //       )
  //     case SAFE_REMAINDER_STATUSES.PUBLISH:
  //       return (
  //         <Button
  //           variant="secondary"
  //           className="text-destructive"
  //           onClick={handleCancel}
  //         >
  //           <IconTrashX />
  //           Draft
  //         </Button>
  //       )
  //     case SAFE_REMAINDER_STATUSES.COMPLETE:
  //       return (
  //         <Button
  //           onClick={handleSubmit}
  //         >
  //           <IconGavel />
  //           PUBLISH
  //         </Button>
  //       )
  //     case SAFE_REMAINDER_STATUSES.RUNNING:
  //       return (
  //         <Button
  //           // disabled={true}
  //           onClick={handleRun}
  //         >
  //           <IconStopwatch />
  //           Stop
  //         </Button>

  //       )

  //     default:
  //       return null;
  //   }
  // }

  return (
    <>
      <div className="m-3 flex-auto">
        <h3 className="text-lg font-bold">
          Inventory Census Detail
        </h3>
        <div>
          {safeRemainder && <StatusBar safeRemainder={safeRemainder} />}
        </div>
        <div className="flex justify-end items-center col-span-2 xl:col-span-3 gap-6">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-accent-foreground">Status:</span>
            <span className="text-primary font-bold">
              {safeRemainder?.status}
            </span>
          </div>
          {/* {renderEvents()} */}
        </div>
      </div>
      <RecordTable.Provider
        columns={adjustDetailTableColumns}
        data={safeRemainderDetails || []}
        stickyColumns={[]}
        className='m-3'
      >
        <RecordTable.Scroll>
          <RecordTable>
            <RecordTable.Header />
            <RecordTable.Body>
              <RecordTable.RowList />
              {!detailsLoading && safeRemainderDetailsCount > safeRemainderDetails?.length && (
                <RecordTable.RowSkeleton rows={4} handleInView={handleFetchMore} />
              )}
            </RecordTable.Body>
          </RecordTable>
        </RecordTable.Scroll>
      </RecordTable.Provider>
    </>
  );
};

const StatusBar = ({ safeRemainder }: { safeRemainder: ISafeRemainder }) => {
  const { date, status } = safeRemainder;

  const renderIcon = (day: Date) => {

    return undefined;
  }


  return (
    <div className="flex flex-wrap items-center justify-start gap-2 max-w-full">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-primary font-bold">
          <DatePicker
            value={safeRemainder?.date}
            onChange={() => null}
            className="h-8 flex w-full"
            disabled={true}
          />
        </span>
        <span className="text-accent-foreground">{'->'}</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-accent-foreground">{'->'}</span>
        <span className="text-primary font-bold">
          <DatePicker
            value={safeRemainder?.date}
            onChange={() => null}
            className="h-8 flex w-full"
            disabled={true}
          />
        </span>
      </div>
    </div>
  );
}