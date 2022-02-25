import BesluitTypePlugin from '../besluit-type-plugin';

function pluginFactory(plugin) {
  return {
    create: (initializers) => {
      const pluginInstance = new plugin();
      Object.assign(pluginInstance, initializers);
      return pluginInstance;
    },
  };
}

export function initialize(application) {
  application.register(
    'plugin:besluit-type',
    pluginFactory(BesluitTypePlugin),
    { singleton: false }
  );
}

export default {
  initialize,
};
