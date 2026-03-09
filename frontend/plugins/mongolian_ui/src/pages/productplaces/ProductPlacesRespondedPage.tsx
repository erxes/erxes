import { useEffect, useRef } from 'react';
import { useAtomValue } from 'jotai';
import { currentUserState } from 'ui-modules';
import { PerResponse } from '~/modules/productplaces/components/PerResponse';
import { Response } from '~/modules/productplaces/components/Response';


let globalWs: WebSocket | null = null;
let globalSubscribed = false;
let globalUserId: string | null = null;

export const ProductPlacesRespondedPage = () => {
  const currentUser = useAtomValue(currentUserState);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const userId = currentUser?._id;
    if (!userId) return;

    if (globalWs && globalUserId === userId) {
      wsRef.current = globalWs;
      return;
    }

    if (globalWs) {
      globalWs.close();
      globalWs = null;
      globalSubscribed = false;
    }

    const connect = () => {
      const ws = new WebSocket('ws://localhost:4000/graphql');
      globalWs = ws;
      globalUserId = userId;
      wsRef.current = ws;

      ws.onopen = () => {
        if (!globalSubscribed) {
          const subMsg = {
            id: '1',
            type: 'subscribe',
            payload: {
              query: `subscription { productPlacesResponded(userId: "${userId}") }`,
            },
          };

          ws.send(JSON.stringify(subMsg));
          globalSubscribed = true;
        }
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (
            msg.type === 'data' &&
            msg.payload?.data?.productPlacesResponded
          ) {
            const rawData = msg.payload.data.productPlacesResponded;

            try {
              const parsedPayload = JSON.parse(rawData);
              const content = JSON.parse(parsedPayload.content);


              if (!content?.length) return;

              const printContents = content.map((receipt: any, index: number) =>
                PerResponse(receipt, index),
              );

              const printMainContent = Response(printContents.join(''));

              const myWindow = window.open(
                '',
                '_blank',
                'width=800,height=800',
              );

              if (myWindow) {
                myWindow.document.write(printMainContent);
                myWindow.document.close();
              } else {
                alert('Please allow pop-ups and redirects in site settings!');
              }
            } catch (e) {
              console.error('Failed to parse subscription payload', e);
            }
          }
        } catch (e) {
          console.error('Failed to parse message', e);
        }
      };

      ws.onerror = (err) => {
        console.error('WebSocket error', err);
      };

      ws.onclose = (event) => {
        globalWs = null;
        globalSubscribed = false;
        globalUserId = null;
        wsRef.current = null;

        setTimeout(connect, 5000);
      };
    };

    connect();

    return () => {
      wsRef.current = null;
    };
  }, [currentUser?._id]);

  return null;
};
