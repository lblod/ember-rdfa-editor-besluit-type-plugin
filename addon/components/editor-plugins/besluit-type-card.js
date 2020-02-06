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

  actions: {
    insert(){
      this.get('hintsRegistry').removeHintsAtLocation(this.get('location'), this.get('hrId'), 'editor-plugins/besluit-type-card');
      const mappedLocation = this.get('hintsRegistry').updateLocationToCurrentIndex(this.get('hrId'), this.get('location'));
      this.get('editor').replaceTextWithHTML(...mappedLocation, this.get('info').htmlString);
    },
    changeDecisionType(e) {
      console.log(e.target.value)
      const result = this.editor.selectContext(this.location, {
        resource: this.besluitUri
      })
      this.editor.update(result, {
        set: {
          resource: e.target.value
        }
      })
      console.log(result)
    }
  }
});
