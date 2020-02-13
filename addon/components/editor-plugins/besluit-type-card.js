import { reads } from '@ember/object/computed';
import Component from '@ember/component';
import layout from '../../templates/components/editor-plugins/besluit-type-card';
import { action } from '@ember/object';


/**
* Card displaying a hint of the Date plugin
*
* @module editor-besluit-type-plugin
* @class BesluitTypeCard
* @extends Ember.Component
*/

export default class BesluitTypeCard extends Component {
  
  /**
   * Region on which the card applies
   * @property location
   * @type [number,number]
   * @private
  */
  @reads('info.location')
  location;

  /**
   * Unique identifier of the event in the hints registry
   * @property hrId
   * @type Object
   * @private
  */
  @reads('info.hrId')
  hrId;

  /**
   * The RDFa editor instance
   * @property editor
   * @type RdfaEditor
   * @private
  */
  @reads('info.editor')
  editor;

  /**
   * Hints registry storing the cards
   * @property hintsRegistry
   * @type HintsRegistry
   * @private
  */
  @reads('info.hintsRegistry')
  hintsRegistry;

  /**
   * URI of the besluit we are interacting with
   * @property besluitUri
   * @type String
   * @private
  */
  @reads('info.besluitUri')
  besluitUri;

  /**
   * Actual besluit type selected
   * @property besluitType
   * @type BesluitType
   * @private
  */
  @reads('info.besluitType')
  besluitType;

  /**
   * Array of Besluit types fetched from the ttl
   * @property besluitType
   * @type BesluitType Array
   * @private
  */
  @reads('info.besluitTypes')
  besluitTypes;

  constructor() {
    super(...arguments);
    this.layout = layout;
  }

  @action
  updateBesluitType(selected) {
    const besluitType = selected;
    this.set('besluitType', besluitType);
  }

  @action
  insert() {
    this.hintsRegistry.removeHintsAtLocation(this.location, this.hrId, this.who);

    let newTypeOfs = null;
    const oldBesluitType = this.info.besluitTypeOfs.filter(type => type.includes('https://data.vlaanderen.be/id/concept/BesluitType/')).firstObject;

    if (oldBesluitType) {
      newTypeOfs = this.info.besluitTypeOfs.map(type => {
        if (type == oldBesluitType) {
          return this.besluitType.typeAttribute;
        } else {
          return type;
        }
      });
    } else {
      newTypeOfs = this.info.besluitTypeOfs;
      newTypeOfs.push(this.besluitType.typeAttribute);
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
    if (oldBesluitType) { // We already have a hidden span in the document, we only need to change its content
      const hiddenSelection = this.editor.selectContext(this.location, {
        typeof: "http://mu.semte.ch/vocabularies/ext/hiddenBesluitType"
      });
      this.editor.update(hiddenSelection, {
        set: {
          innerHTML: this.besluitType
        }
      });

      // Trick: add invisible text to trigger the execute service again // WIP on the editor
      if (oldBesluitType) { // We already have a hidden span in the document, we only need to change its content
        const hiddenSelection = this.editor.selectContext(this.location, {
          typeof: "http://mu.semte.ch/vocabularies/ext/hiddenBesluitType"
        });
        this.editor.update(hiddenSelection, {
          set: {
            innerHTML: this.besluitType.typeAttribute
          }
        });
      } else { // We add the span into the decision
        this.editor.update(selection, {
          prepend: {
            innerHTML: `<span class="u-hidden" typeof="ext:hiddenBesluitType">${this.besluitType.typeAttribute}</span>`
          }
        });
      }
    }
  }
}