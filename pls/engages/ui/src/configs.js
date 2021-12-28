module.exports = {
  name: "engages",
  port: 3001,
  exposes: {
    "./routes": "./src/routes.tsx",
    "./settings": "./src/Settings.tsx",
  },
};