/**
 * Entry point for BesluitTypePlugin
 *
 * @module editor-besluit-type-plugin
 * @class RoadSignRegulationPlugin
 * @constructor
 * @extends EmberService
 */
export default class BesluitTypePlugin {
  get name() {
    return 'besluit-type';
  }

  initialize(transaction, controller) {
    transaction.registerWidget(
      {
        componentName: 'editor-plugins/toolbar-dropdown',
        identifier: 'besluit-type-plugin/dropdown',
        desiredLocation: 'toolbarRight',
      },
      controller
    );
  }
}
