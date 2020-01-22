const script =
  document.currentScript ||
  (() => {
    const scripts = document.getElementsByTagName("script");

    return scripts[scripts.length - 1];
  })();

if (script && script instanceof HTMLScriptElement) {
  const matches = script.src.match(/id=([\w\d]+)&apiUrl=([\w\d:\/.-]+)/);

  if (matches && matches.length >= 3) {
    const id = matches[1];
    const apiUrl = matches[2];

    fetch(`${apiUrl}/script-manager?id=${id}`)
      .then(res => res.text())
      .then(text => {
        const scrpt = document.createElement("script");

        scrpt.innerHTML = text;

        (document.body as any).append(scrpt);
      });
  }
}
