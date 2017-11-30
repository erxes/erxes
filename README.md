# erxes Widgets

Embedable widget scripts server for erxes.

## Running the server

#### 1. Node (version >= 4) and NPM need to be installed.
#### 2. Clone and install dependencies.

```Shell
git clone https://github.com/erxes/erxes-widgets
cd erxes-widgets
yarn install
```

#### 3. Create configuration. We use [dotenv](https://github.com/motdotla/dotenv) for this.

```Shell
cp .env.sample .env
```

This configuration matches with the default configurations of other erxes platform repositories. For the first time run, you don't need to modify it.

#### 4. Start the server.

For development:

```Shell
yarn dev
```

For production:

```Shell
yarn build
yarn start
```

#### 5. Running servers:

Widgets server is running on [http://localhost:3200](http://localhost:3200).


#### Usage:
Script to show the window that communicates with customers
```javascript
  window.erxesSettings = {
      messenger: {
          brand_id: "YDEdKj",
          email: "email",
          name: "username",
          domain: "domain",
          created_at: 1369642043,
      },
  };

  var script = document.createElement('script');
  script.src = "http://localhost:3200/build/messengerWidget.bundle.js";
  script.async = true;

  var entry = document.getElementsByTagName('script')[0];
  entry.parentNode.insertBefore(script, entry);
```
