module.exports = {
  name: "dailyco",
  scope: "dailyco",
  port: 3024,
  exposes: {
    "./routes": "./src/routes.tsx",
    "./inboxEditorAction": "./src/containers/ManageRoom.tsx",
    "./videoCall": "./src/components/VideoCall.tsx",
  },
  routes: {
    url: "http://localhost:3024/remoteEntry.js",
    scope: "dailyco",
    module: "./routes",
  },

  inboxEditorAction: './inboxEditorAction',
  videoCall: './videoCall',
};


