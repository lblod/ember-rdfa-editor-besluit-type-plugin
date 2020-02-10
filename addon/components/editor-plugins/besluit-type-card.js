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

  // Comment : Why we needed didRender() ?

  // didRender() {
  //   const result = this.editor.selectContext(this.location, {
  //     resource: this.besluitUri
  //   });
  //   const typeOf = result.selections[0].richNode.rdfaAttributes._typeof;
  //
  //   let besluitType;
  //   for(let i = 0; i<typeOf.length; i++) {
  //     const type = typeOf[i];
  //     if(type.includes('besluittype:')) {
  //       besluitType = type;
  //       break;
  //     }
  //   }
  //   this.besluitType = besluitType;
  // },

  actions: {
    updateBesluitType(besluitType) {
      this.set('besluitType', besluitType);
    },

    insert() {
      const newBesluitType = this.besluitTyp;
      const result = this.editor.selectContext(this.location, {
        resource: this.besluitUri
      });
      const typeOf = result.selections[0].richNode.rdfaAttributes._typeof;
      let indexTypeOfBesluit = -1;
      for(let i = 0; i<typeOf.length; i++) {
        const type = typeOf[i];
        if(type.includes('besluittype:')) {
          indexTypeOfBesluit = i;
          break;
        }
      }
      if(indexTypeOfBesluit !== -1) {
        typeOf[indexTypeOfBesluit] = newBesluitType;
      } else {
        typeOf.push(newBesluitType);
      }
      this.besluitType = newBesluitType;
      const typeOfString = typeOf.join(' ');
      this.editor.update(result, {
        set: {
          typeof: typeOfString
        }
      });
    }
  }
});
