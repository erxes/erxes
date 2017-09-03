import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import { getTrackerLoader } from '/imports/react-ui/utils';
import { Brands } from '/imports/api/brands/brands';
import { Config } from '../components';

const defaultTemplate = `<p>Dear {{fullName}},</p>
<p>You received following messages at <strong>{{brandName}}</strong>:</p>
<ul class="messages">
  {{#each messages}}
    <li><span>{{content}}</span></li>
  {{/each}}
</ul>
<p><a href="{domain}">See all messages on <strong>{{domain}}</strong></a></p>
<footer>Powered by <a href="https://crm.nmma.co/" target="_blank">Erxes</a>.</footer>

<style type="text/css">
    .erxes-mail {
        font-family: Arial;
        font-size: 13px;
    }
    .messages {
        background: #eee;
        list-style: none;
        padding: 20px;
        margin-bottom: 20px;
    }
    .messages li {
        margin-bottom: 10px;
    }
    .messages li:last-child {
        margin-bottom: 0;
    }
    .messages li span {
        display: inline-block;
        background-color: #482b82;
        padding: 12px 16px;
        border-radius: 5px;
        color: #fff;
    }
    footer {
        border-top: 1px solid #ddd;
        margin-top: 40px;
        padding-top: 10px;
        font-weight: bold;
    }
</style>`;

function composer({ brandId, refetch }, onData) {
  const brandsHandle = Meteor.subscribe('brands.getById', brandId);

  if (!brandsHandle.ready()) {
    return;
  }

  const brand = Brands.findOne(brandId);

  const configFn = (doc, callback) => {
    Meteor.call('brands.configEmail', doc, (...params) => {
      refetch();

      callback(...params);
    });
  };

  onData(null, { brand, configEmail: configFn, defaultTemplate });
}

export default compose(getTrackerLoader(composer))(Config);
