import { DealNoteComposer } from '@/deals/cards/components/detail/overview/DealNoteComposer';

const SalesNoteAndComment = ({ dealId }: { dealId: string }) => {
  return (
    <div className="flex flex-col gap-2 mt-2">
      <DealNoteComposer dealId={dealId} />
    </div>
  );
};

export default SalesNoteAndComment;
