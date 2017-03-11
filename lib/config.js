'use strict';

//Load .env file into environment
require('dotenv').config({
    silent: true
});

module.exports = {
    excludedCategories: ["rent/mortgage/utilities/cash assitance", "christmas", "lawyer - divorce", "lawyer - immigration", "phone", "legal assistance", "tax prep"],
    communityDataHost: process.env.COMMUNITY_DATA_HOST || null,
    communityDataPath: process.env.COMMUNITY_DATA_PATH || null
};
