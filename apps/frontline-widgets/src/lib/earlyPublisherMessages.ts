// The host page loaders post settings to the iframe on its `load` event.
// Routes are lazy chunks, so a route's own message listener can attach after
// that. Hold host messages that arrive before the route mounts and replay them
// once its listeners are in place.
const earlyMessages: MessageEvent[] = [];
let replayed = false;

const holdEarlyMessage = (event: MessageEvent) => {
  if (event.data?.fromPublisher) {
    earlyMessages.push(event);
  }
};

export const holdEarlyPublisherMessages = () => {
  window.addEventListener('message', holdEarlyMessage);
};

export const replayEarlyPublisherMessages = () => {
  if (replayed) {
    return;
  }

  replayed = true;
  window.removeEventListener('message', holdEarlyMessage);

  earlyMessages.splice(0).forEach(({ data, origin, source }) =>
    window.dispatchEvent(new MessageEvent('message', { data, origin, source })),
  );
};
