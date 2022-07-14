'use strict';

module.exports = function (/* environment, appConfig */) {
  return {
    'besluit-type-plugin': {
      //'besluit-types-endpoint': '{{BESLUIT_TYPES_SPARQL_ENDPOINT}}',
      'besluit-types-endpoint': 'https://centrale-vindplaats.lblod.info/sparql',
      //'besluit-types-endpoint': 'http://localhost:83/sparql',
    },
  };
};
