const express = require("express");
const next = require("next");

// Import middleware.
const routes = require("./routes");

// Setup app.
const app = next({ dev: "production" !== process.env.NODE_ENV });
const handle = app.getRequestHandler();
const handler = routes.getRequestHandler(app);

app.prepare().then(() => {
  // Create server.
  const server = express();

  // Use our handler for requests.
  server.use(handler);

  // Don't remove. Important for the server to work. Default route.
  server.get("*", (req, res) => {
    return handle(req, res);
  });

  // Get current port.
  const port = process.env.PORT || 4300;

  // Error check.
  server.listen(port, (err) => {
    if (err) {
      throw err;
    }

    // Where we starting, yo!
    console.log(`> Ready on port ${port}...`);
  });
});
