const express = require('express');
const path = require('path');
// const Promise = require('bluebird');
// const fs = Promise.promisifyAll(require('fs'));
const moment = require('moment');
const getTime = require('./../helpers/time');
const readFromFile = require('./../helpers/read-file');
const { DB_TIMER, REF_TIMER, DB_PATH } = require('./../helpers/config');


const router = express.Router();

const removeUnnecessaryParams = ([key, value]) => key !== 'abpas' && !key.startsWith('_');
const generateQueryString = ([key, value]) => `${key}=${value}`;
const getUrlParams = query => Object.entries(query).filter(removeUnnecessaryParams).map(generateQueryString).join('&');

// router for testing purposes
router.get('/test', (req, res) => res.sendFile(path.join(__dirname, '../views/test.html')));

// old GET => /addSiteVisit/:siteId/:url/:page?
// new POST => /api/pageviews/:id/:page/:pagenum?
router.put('/pageviews/:id/:page/:pagenum?', (req, res) => {
  // params in url `:url` or `:page` => req.params
  const { id, page, pagenum } = req.params;
  // params appended to url after `/?` => req.query
  const { abpas, _server, _ctime, _timestamp } = req.query;

  if (!id || !page || !_ctime || !_timestamp) {
    return res.status(400).send('Bad Request');
  }

  const { year, month, day } = getTime();
  const curDate = `${year}${month}${day}`;
  const datePath = path.join(DB_PATH, curDate);
  const siteIdPath = path.join(datePath, id);

  const tmpPage = page.replace('__x__', '');
  const tmpPageNum = `/${$page}` || '';
  const partUrl = `${tmpPage}${tmpPageNum}`;
  const urlParams = getUrlParams(req.query);

  const splitUrl = [partUrl, urlParams];

  // TODO: continue

  return res.status(200).send('');
});

router.get('/campaign/:id/:date', (req, res) => {
  // POSSIBLE VALUES for `id`:
  // 0, 1, 2, ... n, where `n` represents number of supported websites
  // POSSIBLE VALUES for `date`:
  // -Infinity ... -2, -1, 0 or 20161231,
  // WHERE:
  //       0 - current date,
  //      -1 - yesterday,
  //      -2 - day before yesterday
  const { id, date } = req.params;
  const { year, month, day } = getTime();
  const today = `${year}${month}${day}`;

  if ((date > 0 && date.length < 8) || date > today) {
    return res.status(404).send(`Data for siteId: ${id} not found`);
  }

  if (date === '0') { // use current date
    const { abCampaign } = global.analytics;
    if (!abCampaign[today] || !abCampaign[today][id]) {
      return res.status(404).send('Data not found');
    }
    return res.status(200).json(abCampaign[today][id]);
  }
  // not today
  const beforeToday = (date.length < today.length) ? moment(today).add(date).format('YYYYMMDD') : date;
  const filePath = path.join(DB_PATH, beforeToday, `${id}_campaign.json`);
  return readFromFile(filePath)
    .then(data => res.status(200).json(data))
    .catch((err) => {
      console.error(err);
      return res.status(404).send('File not found');
    });
});

router.get('/referrer/:id', (req, res) => {
  const { id } = req.params;
  const { referrer } = global.analytics;
  const data = referrer[id] || 'No Data';
  res.status(200).send(data);
});

module.exports = router;
