import { BroadcastEditor } from '../BroadcastEditor';

export const BroadcastMessengerPreview = () => {
  return (
    <div className="h-full p-10">
      <div className="bg-white rounded-md h-full py-8">
        <BroadcastEditor attribute />
      </div>
    </div>
  );
};
