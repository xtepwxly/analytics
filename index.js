const express = require('express');
const app = express();
const Promise = require('bluebird');
const moment = require('moment');
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');
const dotenv = require('dotenv').config();
const getTime = require('./helpers/time');
const bodyParser = require('body-parser');
const { DB_TIMER, REF_TIMER, DB_PATH } = require('./helpers/config');
const indexRoutes = require('./routes/index');
const dashboardRoutes = require('./routes/dashboard');
const otherRoutes = require('./routes/other');

const port = process.env.PORT || 3000;

const analytics = {
  websites: {},
  abCampaign: {},
  serverStats: {},
  referrer: {},
};

let timestamp = {}; // timestamp for serverStats

let isBusy = false;
let lastUpdateDbTime = null;
let lastUpdateRefTime = null;

app.use('/assets', express.static('public'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', indexRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('*', otherRoutes);

// prevents some basic attacks on express framework
app.disable('x-powered-by');

app.listen(port, require('./lib/init')(analytics));

// TODO:
// continue work on api code
// use logs instead of console.error and console.log
// cluster api vs pm2
// return favicon
// basic design for frontend: http://coenraets.org/blog/2012/10/real-time-web-analytics-with-node-js-and-socket-io/
// add react for frontend
// advanced design for dashboard from "TIM"?
// configure .eslint for react
// make decent design
// express-generator to change structure of project
