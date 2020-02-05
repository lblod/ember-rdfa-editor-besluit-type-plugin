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
  execute: task(function * (hrId, contexts, hintsRegistry, editor) {
    if (contexts.length === 0) return [];
    const hints = [];
    contexts.forEach((context) => {
      const isRelevantContext = this.detectRelevantContext(context);

      if (isRelevantContext) {
        let besluitNode = null;
        let tmp = context.semanticNode;
        while (!besluitNode) {
          if (tmp.rdfaAttributes && tmp.rdfaAttributes.typeof && tmp.rdfaAttributes.typeof.includes('http://data.vlaanderen.be/ns/besluit#Besluit')) {
            besluitNode = tmp;
          } else {
            tmp = tmp.parent;
          }
        }

        // TODO: create a helper to get besluitNode and create proper hints
        hintsRegistry.removeHintsInRegion([besluitNode.start, besluitNode.end], hrId, this.get('who'));
        hints.pushObjects(this.generateHintsForContext(context));
      }
    });

    const cards = hints.map( (hint) => this.generateCard(hrId, hintsRegistry, editor, hint));

    if(cards.length > 0){
      hintsRegistry.addHints(hrId, this.get('who'), cards);
    }
    yield 1
  }),

  /**
   * Given context object, tries to detect a context the plugin can work on
   *
   * @method detectRelevantContext
   *
   * @param {Object} context Text snippet at a specific location with an RDFa context
   *
   * @return {String} URI of context if found, else empty string.
   *
   * @private
   */
  detectRelevantContext(context){
    let decisions = context.context.filter( o => o.object == 'http://data.vlaanderen.be/ns/besluit#Besluit');
    return decisions.length > 0;
  },



  /**
   * Maps location of substring back within reference location
   *
   * @method normalizeLocation
   *
   * @param {[int,int]} [start, end] Location withing string
   * @param {[int,int]} [start, end] reference location
   *
   * @return {[int,int]} [start, end] absolute location
   *
   * @private
   */
  normalizeLocation(location, reference){
    return [location[0] + reference[0], location[1] + reference[0]];
  },

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
        hrId, hintsRegistry, editor
      },
      location: hint.location,
      card: this.get('who')
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
  generateHintsForContext(context){
    const hints = [];
    const index = context.text.toLowerCase().indexOf('hello');
    const text = context.text.slice(index, index+5);
    const location = this.normalizeLocation([index, index + 5], context.region);
    hints.push({text, location});
    return hints;
  }
});

RdfaEditorBesluitTypePlugin.reopen({
  who: 'editor-plugins/besluit-type-card'
});
export default RdfaEditorBesluitTypePlugin;
