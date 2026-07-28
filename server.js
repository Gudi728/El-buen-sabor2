const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const env = require('./config/env');
const { initializeFirebase } = require('./config/firebase');
const webRoutes = require('./routes/web.routes');
const apiRoutes = require('./routes/api.routes');
const adminRoutes = require('./routes/admin.routes');
const notFoundHandler = require('./middleware/notFound.middleware');
const errorHandler = require('./middleware/error.middleware');

const app = express();
const publicPath = path.join(__dirname, 'public');

initializeFirebase();

app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(publicPath));

app.use('/', webRoutes);
app.use('/api', apiRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Servidor activo en http://localhost:${env.port}`);
});
