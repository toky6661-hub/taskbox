// src/server.js

const app = require("./app.js");

// Local dev: listen on port (Vercel production skips this)
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Vercel Services mode: export Express app directly
module.exports = app;
