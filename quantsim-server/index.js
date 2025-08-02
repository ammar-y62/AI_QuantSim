// entry point for our Express.js backend (set up server, middleware, and routing)

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000; //we"ll change the port later on

// communication middleware
app.use(cors());
app.use(express.json());

// auth route (login and register endpoints)
app.use('/api/auth', require('./routes/authRoutes'));

// stocks route
app.use('/api/stocks', require('./routes/stockRoutes'));

// api routes basis
const testRoutes = require('./routes/testRoutes');
app.use('/api', testRoutes);

// get the server live
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
