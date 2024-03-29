/**
 * Entry point for BesluitTypePlugin
 *
 * @module editor-besluit-type-plugin
 * @class RoadSignRegulationPlugin
 * @constructor
 * @extends EmberService
 */
export default class BesluitTypePlugin {
  /**
   * Handles the incoming events from the editor dispatcher.  Responsible for generating hint cards.
   *
   * @method execute
   *
   * @param {string} hrId Unique identifier of the state in the HintsRegistry.  Allows the
   * HintsRegistry to update absolute selected regions based on what a user has entered in between.
   * @param {Array} rdfaBlocks Set of logical blobs of content which may have changed.  Each blob is
   * either has a different semantic meaning, or is logically separated (eg: a separate list item).
   * @param {Object} hintsRegistry Keeps track of where hints are positioned in the editor.
   * @param {Object} editor Your public interface through which you can alter the document.
   *
   * @public
   */
  controller;

  get name() {
    return 'besluit-type';
  }

  initialize(controller) {
    this.controller = controller;
    controller.registerWidget({
      componentName: 'editor-plugins/toolbar-dropdown',
      identifier: 'besluit-type-plugin/dropdown',
      desiredLocation: 'toolbar',
    });
  }
}
