export const openWindow = (
  conversationId: string,
  url: string,
  name: string
) => {
  if (!window || !window.top) {
    return;
  }

  const height = 600;
  const width = 480;

  const y = window.top.outerHeight / 2 + window.top.screenY - height / 2;
  const x = window.top.outerWidth / 2 + window.top.screenX - width / 2;

  window.open(
    `/videoCall?url=${url}&name=${name}&conversationId=${conversationId}`,
    '_blank',
    `toolbar=no,titlebar=no,directories=no,menubar=no,location=no,scrollbars=yes,status=no,height=${height},width=${width},top=${y},left=${x}`
  );
};
