// app.js

const express = require('express');
const config = require('./config/config');
const glob = require('glob');
const mongoose = require('mongoose');
const cron = require('cron');
const Scraper = require('./app/services/scraper');

const ScraperService = new Scraper();

const db = mongoose.connection;
db.on('error', () => {
    throw new Error(`Unable to connect to database at ${config.db}`);
});

const models = glob.sync(`${config.root}/app/models/*.js`);
models.forEach((model) => {
    require(model); // eslint-disable-line global-require
});

const app = express();

require('./config/express')(app, config);

app.listen(config.port, config.ip_address, () => {
    console.info(`Listening at ${config.ip_address}:${config.port}`);
});

const cronJob = cron.job('0 */30 * * * *', () => {
    ScraperService.scrape();
});
cronJob.start();

module.exports = app;
