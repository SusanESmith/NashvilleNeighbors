'use strict';

//Load .env file into environment
require('dotenv').config({
    silent: true
});

module.exports = {
    communityDataUrl: process.env.COMMUNITY_DATA_URL || null
}
