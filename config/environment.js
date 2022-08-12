'use strict';

module.exports = function (/* environment, appConfig */) {
  return {
    besluitTypePlugin: {
      endpoint: 'https://centrale-vindplaats.lblod.info/sparql',
    },
  };
};
