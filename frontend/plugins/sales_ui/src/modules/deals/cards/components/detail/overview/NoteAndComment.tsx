import {
  ActivityLogs,
  AddInternalNote,
  internalNoteCustomActivity,
} from 'ui-modules';

const SalesNoteAndComment = ({ dealId }: { dealId: string }) => {
  return (
    <div className="flex flex-col mb-12 mt-4">
      <ActivityLogs
        targetId={dealId}
        customActivities={[internalNoteCustomActivity]}
      />
      <AddInternalNote contentTypeId={dealId} contentType="sales:deal" />
    </div>
  );
};

export default SalesNoteAndComment;
