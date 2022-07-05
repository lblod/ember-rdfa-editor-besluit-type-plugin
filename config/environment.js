'use strict';

module.exports = function (/* environment, appConfig */) {
  return {
    'besluit-type-plugin': {
      'besluit-types-endpoint': 'http://localhost:8895/sparql',
    },
  };
};
