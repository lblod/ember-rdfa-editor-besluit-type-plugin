import { getOwner } from '@ember/application';
import Service from '@ember/service';
import EmberObject from '@ember/object';
import { task } from 'ember-concurrency';

/**
 * Service responsible for correct annotation of dates
 *
 * @module editor-besluit-type-plugin
 * @class RdfaEditorBesluitTypePlugin
 * @constructor
 * @extends EmberService
 */
const RdfaEditorBesluitTypePlugin = Service.extend({

  init(){
    this._super(...arguments);
    const config = getOwner(this).resolveRegistration('config:environment');
  },

  /**
   * task to handle the incoming events from the editor dispatcher
   *
   * @method execute
   *
   * @param {string} hrId Unique identifier of the event in the hintsRegistry
   * @param {Array} contexts RDFa contexts of the text snippets the event applies on
   * @param {Object} hintsRegistry Registry of hints in the editor
   * @param {Object} editor The RDFa editor instance
   *
   * @public
   */
   execute: task(function * (hrId, rdfaBlocks, hintsRegistry, editor) {
    if (rdfaBlocks.length === 0) return [];
    let hints = [];

    const uniqueRichNodes = editor.findUniqueRichNodes(rdfaBlocks, { typeof: 'http://data.vlaanderen.be/ns/besluit#Besluit' });

    uniqueRichNodes.forEach((richNode) => {
      hintsRegistry.removeHintsInRegion([richNode.start, richNode.end], hrId, this.get('who'));
      hints.pushObjects(this.generateHintsForContext(richNode));
    });

    const cards = hints.map( (hint) => this.generateCard(hrId, hintsRegistry, editor, hint));

    if(cards.length > 0){
      hintsRegistry.addHints(hrId, this.get('who'), cards);
    }
  }),

  /**
   * Generates a card given a hint
   *
   * @method generateCard
   *
   * @param {string} hrId Unique identifier of the event in the hintsRegistry
   * @param {Object} hintsRegistry Registry of hints in the editor
   * @param {Object} editor The RDFa editor instance
   * @param {Object} hint containing the hinted string and the location of this string
   *
   * @return {Object} The card to hint for a given template
   *
   * @private
   */
  generateCard(hrId, hintsRegistry, editor, hint){
    return EmberObject.create({
      info: {
        label: this.get('who'),
        plainValue: hint.text,
        htmlString: '<b>hello world</b>',
        location: hint.location,
        besluitUri: hint.uri,
        besluitTypeOfs: hint.typeof,
        hrId, hintsRegistry, editor
      },
      location: hint.location,
      card: this.get('who'),
      options: { noHighlight: true }
    });
  },

  /**
   * Generates a hint, given a context
   *
   * @method generateHintsForContext
   *
   * @param {Object} context Text snippet at a specific location with an RDFa context
   *
   * @return {Object} [{dateString, location}]
   *
   * @private
   */
  generateHintsForContext(besluit) {
    const hints = [];
    const uri = besluit.rdfaAttributes.resource;
    hints.push({
      typeof: besluit.rdfaAttributes.typeof,
      location: besluit.region,
      uri
    });
    return hints;
  }
});

RdfaEditorBesluitTypePlugin.reopen({
  who: 'editor-plugins/besluit-type-card'
});
export default RdfaEditorBesluitTypePlugin;
