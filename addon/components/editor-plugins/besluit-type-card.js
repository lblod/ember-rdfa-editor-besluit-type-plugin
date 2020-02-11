import { reads } from '@ember/object/computed';
import Component from '@ember/component';
import layout from '../../templates/components/editor-plugins/besluit-type-card';

/**
* Card displaying a hint of the Date plugin
*
* @module editor-besluit-type-plugin
* @class BesluitTypeCard
* @extends Ember.Component
*/
export default Component.extend({
  layout,

  /**
   * Region on which the card applies
   * @property location
   * @type [number,number]
   * @private
  */
  location: reads('info.location'),

  /**
   * Unique identifier of the event in the hints registry
   * @property hrId
   * @type Object
   * @private
  */
  hrId: reads('info.hrId'),

  /**
   * The RDFa editor instance
   * @property editor
   * @type RdfaEditor
   * @private
  */
  editor: reads('info.editor'),

  /**
   * Hints registry storing the cards
   * @property hintsRegistry
   * @type HintsRegistry
   * @private
  */
  hintsRegistry: reads('info.hintsRegistry'),
  besluitUri: reads('info.besluitUri'),
  besluitType: reads('info.besluitType'),

  actions: {
    updateBesluitType(besluitType) {
      this.set('besluitType', besluitType);
    },

    insert() {
      this.hintsRegistry.removeHintsAtLocation(this.location, this.hrId, this.who);

      let newTypeOfs = null;
      const oldBesluitType = this.info.besluitTypeOfs.filter(type => type.includes('https://data.vlaanderen.be/id/concept/BesluitType/')).firstObject;

      if (oldBesluitType) {
        newTypeOfs = this.info.besluitTypeOfs.map(type => {
          if (type == oldBesluitType) {
            return this.besluitType;
          } else {
            return type;
          }
        })
      } else {
        newTypeOfs = this.info.besluitTypeOfs;
        newTypeOfs.push(this.besluitType);
      }

      const selection = this.editor.selectContext(this.location, {
        resource: this.besluitUri
      });

      this.editor.update(selection, {
        set: {
          typeof: newTypeOfs
        }
      });

      // Trick: add invisible text to trigger the execute service again // WIP on the editor
      this.editor.update(selection, {
        prepend: {
          innerHTML: `<span class="u-hidden">${new Date()}</span>`
        }
      });
    }
  }
});
