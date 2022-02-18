export default class ScriptLoader {
  src: any;
  isLoaded: boolean;
  constructor(options) {
    const { src } = options;
    this.src = src;
    this.isLoaded = false;
  }

  loadScript() {
    return new Promise((resolve, reject) => {
      // Create script element and set attributes
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = this.src;

      window.document.body.appendChild(script);

      // Resolve the promise once the script is loaded
      script.addEventListener('load', () => {
        this.isLoaded = true;
        console.log('script loaded');
        resolve(script);
      });

      // Catch any errors while loading the script
      script.addEventListener('error', () => {
        reject(new Error(`${this.src} failed to load.`));
      });
    });
  }

  load() {
    return new Promise(async (resolve, reject) => {
      if (!this.isLoaded) {
        try {
          await this.loadScript();
          resolve(window);
        } catch (e) {
          reject(e);
        }
      } else {
        resolve(window);
      }
    });
  }
}
