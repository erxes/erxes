# erxes Inc - erxes Widgets

Embedable widget scripts server for erxes

<a href="https://demohome.erxes.io/">View demo</a> <b>| </b> <a href="https://github.com/erxes/erxes-widgets/archive/master.zip">Download ZIP </a> <b> | </b> <a href="https://gitter.im/erxes/Lobby">Join us on Gitter</a>

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

## Contributors

This project exists thanks to all the people who contribute. [[Contribute]](CONTRIBUTING.md).
<a href="graphs/contributors"><img src="https://opencollective.com/erxes/contributors.svg?width=890" /></a>


## Backers

Thank you to all our backers! 🙏 [[Become a backer](https://opencollective.com/erxes#backer)]

<a href="https://opencollective.com/erxes#backers" target="_blank"><img src="https://opencollective.com/erxes/backers.svg?width=890"></a>


## Sponsors

Support this project by becoming a sponsor. Your logo will show up here with a link to your website. [[Become a sponsor](https://opencollective.com/erxes#sponsor)]

<a href="https://opencollective.com/erxes/sponsor/0/website" target="_blank"><img src="https://opencollective.com/erxes/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/erxes/sponsor/1/website" target="_blank"><img src="https://opencollective.com/erxes/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/erxes/sponsor/2/website" target="_blank"><img src="https://opencollective.com/erxes/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/erxes/sponsor/3/website" target="_blank"><img src="https://opencollective.com/erxes/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/erxes/sponsor/4/website" target="_blank"><img src="https://opencollective.com/erxes/sponsor/4/avatar.svg"></a>
<a href="https://opencollective.com/erxes/sponsor/5/website" target="_blank"><img src="https://opencollective.com/erxes/sponsor/5/avatar.svg"></a>
<a href="https://opencollective.com/erxes/sponsor/6/website" target="_blank"><img src="https://opencollective.com/erxes/sponsor/6/avatar.svg"></a>
<a href="https://opencollective.com/erxes/sponsor/7/website" target="_blank"><img src="https://opencollective.com/erxes/sponsor/7/avatar.svg"></a>
<a href="https://opencollective.com/erxes/sponsor/8/website" target="_blank"><img src="https://opencollective.com/erxes/sponsor/8/avatar.svg"></a>
<a href="https://opencollective.com/erxes/sponsor/9/website" target="_blank"><img src="https://opencollective.com/erxes/sponsor/9/avatar.svg"></a>

## In-kind sponsors

<a href="https://www.cloudflare.com/" target="_blank"><img src="https://erxes.io/img/logo/cloudflare.png" width="130px;" />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</a>
<a href="https://www.saucelabs.com/" target="_blank"><img src="https://erxes.io/img/logo/saucelabs.png" width="130px;" />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</a>
<a href="https://www.transifex.com/" target="_blank"><img src="https://erxes.io/img/logo/transifex.png" width="100px;" /></a>

## Copyright & License
Copyright (c) 2018 erxes Inc - Released under the [MIT license.](https://github.com/erxes/erxes/blob/develop/LICENSE.md)
