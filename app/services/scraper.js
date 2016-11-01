const cheerio = require('cheerio');
const events = require('events');
const Program = require('../models/program');
const Channel = require('../models/channel');
const rp = require('request-promise');
const moment = require('moment-timezone');

const eventEmitter = new events.EventEmitter();

// We need finnish localization
moment.locale('fi');

module.exports = class Scraper {
    constructor() {
        Object.assign(this, {
            descriptions: [],
            names: [],
            seasons: [],
            episodes: [],
            starts: [],
            ends: [],
            allPrograms: [],
            channels: [],
        });

        Channel.find().select({ name: 1, _id: 0 })
            .then((channels) => {
                this.channels = channels.map(channel => channel.name);
            })
            .catch((err) => {
                throw err;
            });
    }

    searchSeasonNumber(description) {
        const start = description.indexOf('Kausi');
        let seasonNumber = '-';

        if (description.charAt(start + 7) === ',') {
            seasonNumber = description.substr(start + 6, 1);
        } else if (description.charAt(start + 8) === ',') {
            seasonNumber = description.substr(start + 6, 2);
        } else if (description.charAt(start + 7) === '.') {
            seasonNumber = description.substr(start + 6, 1);
        } else if (description.charAt(start + 8) === '.') {
            seasonNumber = description.substr(start + 6, 2);
        }
        return Number.isNaN(seasonNumber / 1) ? '-' : seasonNumber;
    }

    searchEpisodeNumber(description) {
        let start = 0;
        let episodeNumber = '-';

        description = description.toLowerCase();

        if (description.indexOf('jakso') !== -1) {
            start = description.indexOf('jakso');

            if (description.charAt(start + 7) === '/') {
                episodeNumber = description.substr(start + 6, 1);
            } else if (description.charAt(start + 8) === '/') {
                episodeNumber = description.substr(start + 6, 2);
            } else if (description.charAt(start + 7) === '.') {
                episodeNumber = description.substr(start + 6, 1);
            } else if (description.charAt(start + 8) === '.') {
                episodeNumber = description.substr(start + 6, 2);
            }
        } else if (description.indexOf('osa') !== -1) {
            start = description.indexOf('osa');

            if (description.charAt(start + 5) === '.') {
                episodeNumber = description.substr(start + 4, 1);
            } else if (description.charAt(start + 6) === '.') {
                episodeNumber = description.substr(start + 4, 2);
            } else if (description.indexOf(':') !== -1) {
                const end = description.indexOf(':');
                episodeNumber = description.substr(start + 4, end - (start + 4));
            }
        } else if (description.indexOf('kausi') !== -1) {
            start = description.indexOf('kausi');

            if (description.charAt(start + 10) === '/') {
                episodeNumber = description.substr(start + 9, 1);
            } else if (description.charAt(start + 11 === '/')) {
                episodeNumber = description.substr(start + 9, 2);
            }
        }

        return Number.isNaN(episodeNumber / 1) ? '-' : episodeNumber;
    }

    searchProgramName(summary) {
        let name = summary;
        const start = summary.indexOf('(');

        if (start !== -1) {
            name = summary.substr(0, start - 1);
        }
        return name;
    }

    formatDate(dateString) {
        return moment(dateString, 'DD/MM/YYYY hh:mm').format();
    }

    // Gets information for every channel
    processBaseInformation(body, channelName) {
        this.descriptions.length = 0;
        this.names.length = 0;
        this.seasons.length = 0;
        this.episodes.length = 0;
        this.starts.length = 0;
        this.ends.length = 0;

        const $ = cheerio.load(body);

        $('._summary').each((i, elem) => {
            const summary = elem.children[0].data;
            this.names[i] = this.searchProgramName(summary);
        });

        $('._description').each((i, elem) => {
            const description = elem.children.length > 0 ? elem.children[0].data : '';

            if (description.length === 0) {
                this.descriptions[i] = 'Ei kuvausta saatavilla.';
                this.seasons[i] = '-';
                this.episodes[i] = '-';
            } else {
                this.descriptions[i] = description;
                this.seasons[i] = this.searchSeasonNumber(description);
                this.episodes[i] = this.searchEpisodeNumber(description);
            }
        });

        $('._start').each((i, elem) => {
            this.starts[i] = elem.children.length > 0 ? this.formatDate(elem.children[0].data) : '';
        });

        $('._end').each((i, elem) => {
            this.ends[i] = elem.children.length > 0 ? this.formatDate(elem.children[0].data) : '';
        });

        const programs = [];

        // this combines information to JSON
        for (let i = 0; i < this.names.length; i += 1) {
            const name = this.names[i];
            const description = this.descriptions[i];
            const season = this.seasons[i];
            const episode = this.episodes[i];
            const start = this.starts[i];
            const end = this.ends[i];

            const temp = {
                name,
                description,
                season,
                episode,
                start,
                end,
            };

            programs.push(temp);

            const newProgram = new Program({
                channelName,
                data: temp,
            });

            newProgram.save((err) => {
                if (err) throw err;
            });
        }

        const temp = {
            channelName,
            data: programs,
        };

        this.allPrograms.push(temp);

        if (this.allPrograms.length === this.channels.length) {
            eventEmitter.emit('base_finished');
        }
    }

    scrape() {
        this.allPrograms.length = 0;
        this.descriptions.length = 0;
        this.names.length = 0;
        this.seasons.length = 0;
        this.episodes.length = 0;
        this.starts.length = 0;
        this.ends.length = 0;

        Program.remove().exec();

        const today = moment().tz('Europe/Helsinki').format('dddd');

        const promises = [];

        this.channels.forEach((channel) => {
            promises.push(rp(`http://www.telsu.fi/${today}/${channel}`));
        });

        Promise.all(promises).then((results) => {
            results.forEach((channel, index) => {
                this.processBaseInformation(channel, this.channels[index]);
            });
        });
    }
};

// module.exports = {
//     searchSeasonNumber,
//     searchEpisodeNumber,
//     searchProgramName,
//     formatDate,
//     scrape,
// };
