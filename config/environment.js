'use strict';

module.exports = function (/* environment, appConfig */) {
  return {
    'besluit-type-plugin': {
      'besluit-types-endpoint': '{{BESLUIT_TYPES_SPARQL_ENDPOINT}}',
    },
  };
};
