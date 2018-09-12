export default (containerId, checked) => {
  const container = document.getElementById(containerId);
  const elements = container.getElementsByTagName('input');

  for (const item of elements) {
    if (item.type === 'checkbox') {
      item.checked = checked;
    }
  }
};
