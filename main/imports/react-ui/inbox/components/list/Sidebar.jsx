import { Meteor } from 'meteor/meteor';
import React, { PropTypes } from 'react';
import { Counts } from 'meteor/tmeasday:publish-counts';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { EmptyState } from '/imports/react-ui/common';
import { Wrapper } from '/imports/react-ui/layout/components';
import { CONVERSATION_STATUSES } from '/imports/api/conversations/constants';


const propTypes = {
  channels: PropTypes.array.isRequired,
  brands: PropTypes.array.isRequired,
  tags: PropTypes.array.isRequired,
};

function Sidebar({ channels, tags, brands }) {
  return (
    <Wrapper.Sidebar>
      <Wrapper.Sidebar.Section collapsible length={channels.length}>
        <h3>
          Channels
          <a href={FlowRouter.path('inbox/list')} className="quick-button">
            All
          </a>
        </h3>
        <ul className="filters">
          {
           channels.map(channel => (
             <li key={channel._id}>
               <a href={FlowRouter.path('inbox/list', { channelId: channel._id })}>
                 <span className="icon">#</span>{channel.name}
                 <span className="counter">
                   {Counts.get(`conversations.counts.byChannel${channel._id}`)}
                 </span>
               </a>
             </li>
           ))
          }
          {
            channels.length === 0 ?
              <EmptyState
                icon={<i className="ion-pound" />}
                text="No channel"
                size="small"
              /> :
              null
          }
        </ul>
      </Wrapper.Sidebar.Section>
      <Wrapper.Sidebar.Section collapsible length={brands.length}>
        <h3>
          Brands
          <a href="/inbox" className="quick-button">
            All
          </a>
        </h3>
        <ul className="filters">
          {
            brands.map(brand => (
              <li key={brand._id}>
                <a href={`?brandId=${brand._id}`}>
                  <span className="icon">#</span>{brand.name}
                  <span className="counter">
                    {Counts.get(`conversations.counts.byBrand${brand._id}`)}
                  </span>
                </a>
              </li>
           ))
          }
          {
            brands.length === 0 ?
              <EmptyState
                icon={<i className="ion-flag" />}
                text="No brand"
                size="small"
              /> :
              null
          }
        </ul>
      </Wrapper.Sidebar.Section>
      <Wrapper.Sidebar.Section>
        <h3>
          Filter by status
          <a href="#" className="quick-button">
            Clear
          </a>
        </h3>
        <ul className="filters">
          <li>
            <a href="?unassigned=true">
              Unassigned
              <span className="counter">
               {Counts.get('conversations.counts.unassiged')}
              </span>
            </a>
          </li>
          <li>
            <a href={`?participatedUserId=${Meteor.userId()}`}>
              Participating
              <span className="counter">
                {Counts.get('conversations.counts.participating')}
              </span>
            </a>
          </li>
          <li>
            <a href={`?status=${CONVERSATION_STATUSES.CLOSED}`}>
              Resolved
              <span className="counter">
                {Counts.get('conversations.counts.resolved')}
              </span>
            </a>
          </li>
          <li>
            <a href="?starred=1">
             Starred
              <span className="counter">
                {Counts.get('conversations.counts.starred')}
              </span>
            </a>
          </li>
        </ul>
      </Wrapper.Sidebar.Section>
      <Wrapper.Sidebar.Section collapsible length={tags.length}>
        <h3>
          Filter by tags
          <a href={FlowRouter.path('tags/list', { type: 'conversation' })} className="quick-button">
            <i className="ion-gear-a" />
          </a>
        </h3>
        <ul className="filters">
         {
           tags.map(tag => (
             <li key={tag._id}>
               <a
                 href={FlowRouter.path(
                   'inbox/list',
                   { channelId: FlowRouter.getParam('channelId') },
                   { tagId: tag._id }
                 )}
               >
                 <i className="fa fa-tag icon" style={{ color: tag.colorCode }}></i>{tag.name}
                 <span className="counter">
                   {Counts.get(`conversations.counts.byTag${tag._id}`)}
                 </span>
               </a>
             </li>
           ))
         }
         {
           tags.length === 0 ?
             <EmptyState
               icon={<i className="ion-pricetag" />}
               text="No tags"
               size="small"
             /> :
             null
         }
        </ul>
      </Wrapper.Sidebar.Section>
    </Wrapper.Sidebar>
  );
}

Sidebar.propTypes = propTypes;

export default Sidebar;
