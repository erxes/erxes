import { sendCoreMessage } from '../messageBroker';

const CONTENT_TYPE = 'timeclock';

export const sendMobileNotification = (
  receivers: string[],
  actionType: string,
  item: any,
  itemType: string,
  extraParams?: any
) => {
  sendCoreMessage({
    subdomain: 'os',
    action: 'sendMobileNotification',
    data: {
      title: `Timeclock`,
      body: createNotificationBody(actionType, extraParams),
      receivers,
      data: {
        type: CONTENT_TYPE,
        id: item._id,
        actionType
      }
    }
  });
};

const createNotificationBody = (actionType: string, extraParams?: any) => {
  let body = '';
  if (actionType === 'requestSolved') {
    const { reason, approved } = extraParams;

    body = `Таны ${reason} - хүсэлт ${approved ? 'батлагдлаа' : 'цуцлагдлаа'}`;
    return body;
  }

  if (actionType === 'scheduleCreated') {
    body = 'Таны ажлын төлөвлөгөө орсон байна, төлөвлөгөөтэйгээ танилцаарай ';
    return body;
  }

  if (actionType === 'vacationEnded') {
    const { finishingDays } = extraParams;
    body = `Таны ээлжийн амралт ${finishingDays} өдрийн дараа дуусч байна`;

    return body;
  }
};
