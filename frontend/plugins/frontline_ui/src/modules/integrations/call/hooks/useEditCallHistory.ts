import { useMutation } from '@apollo/client';
import { callHistoryEdit } from '../graphql/mutations/callMutations';
//import { toast } from 'erxes-ui';
import { useAtom } from 'jotai';
import { historyIdAtom } from '@/integrations/call/states/callStates';
import { callConfigAtom } from '@/integrations/call/states/sipStates';
import * as moment from 'moment';

export const useUpdateCallHistory = () => {
  const [updateHistoryMutation, { loading }] = useMutation(callHistoryEdit);
  const [historyId, setHistoryId] = useAtom(historyIdAtom);
  const [config] = useAtom(callConfigAtom);

  const updateHistory = (
    timeStamp: number,
    callStartTime: Date,
    callEndTime: Date,
    callStatus: string,
    direction: string,
    customerPhone: string,
    transferStatus?: string,
    endedBy?: string,
    explicitHistoryId?: string,
  ) => {
    const transferredCallStatus = localStorage.getItem('transferredCallStatus');
    let duration = 0;

    if (callStartTime && callEndTime) {
      const startedMoment = moment(callStartTime);
      const endedMoment = moment(callEndTime);
      duration = endedMoment.diff(startedMoment, 'seconds');
    }

    const idToUse = explicitHistoryId || historyId;

    if (idToUse) {
      updateHistoryMutation({
        variables: {
          id: idToUse,
          timeStamp: parseInt(timeStamp.toString()),
          callStartTime,
          callEndTime,
          callDuration: duration,
          callStatus,
          callType: direction,
          customerPhone,
          transferredCallStatus: transferStatus
            ? 'remote'
            : transferredCallStatus,
          endedBy,
        },
        refetchQueries: ['callHistories'],
      })
        .then(() => {
          setHistoryId('');
        })
        .catch((e) => {
          setHistoryId('');

          if (e.message !== 'You cannot edit') {
            // toast({
            //   title: 'Uh oh! Something went wrong updating history.',
            //   description: e.message,
            //   variant: 'destructive',
            // });
          }
        });
    } else {
      if (callStatus === 'cancelled') {
        updateHistoryMutation({
          variables: {
            timeStamp: parseInt(timeStamp.toString()),
            callStartTime,
            callEndTime,
            callDuration: duration,
            callStatus,
            inboxIntegrationId: config?.inboxId || '',
            customerPhone,
            callType: direction,
            endedBy,
          },
          refetchQueries: ['callHistories'],
        })
          .then(() => {
            console.log(
              'Successfully created new history entry for cancelled call',
            );
            setHistoryId('');
          })
          .catch((e) => {
            console.error('Failed to create history for cancelled call:', e);
            setHistoryId('');

            if (e.message !== 'You cannot edit') {
              //   toast({
              //     title: 'Uh oh! Something went wrong creating history.',
              //     description: e.message,
              //     variant: 'destructive',
              //   });
            }
          });
      } else {
        console.error('No historyId available for status:', callStatus);
        // toast({
        //   title: 'Uh oh! Something went wrong.',
        //   description: 'History id not found',
        //   variant: 'destructive',
        // });
      }
    }
  };

  return {
    updateHistory,
    loading,
  };
};
