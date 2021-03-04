import { tracked } from '@glimmer/tracking';
import { reads } from '@ember/object/computed';
import Component from '@glimmer/component';
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
  @reads('args.info.location')
  location;

  /**
   * Unique identifier of the event in the hints registry
   * @property hrId
   * @type Object
   * @private
   */
  @reads('args.info.hrId')
  hrId;

  /**
   * The RDFa editor instance
   * @property editor
   * @type RdfaEditor
   * @private
   */
  @reads('args.info.editor')
  editor;

  /**
   * Hints registry storing the cards
   * @property hintsRegistry
   * @type HintsRegistry
   * @private
   */
  @reads('args.info.hintsRegistry')
  hintsRegistry;

  /**
   * URI of the besluit we are interacting with
   * @property besluitUri
   * @type String
   * @private
   */
  @reads('args.info.besluitUri')
  besluitUri;

  /**
   * Actual besluit type selected
   * @property besluitType
   * @type BesluitType
   * @private
   */
  @reads('args.info.besluitType')
  besluitType;

  /**
   * Array of Besluit types fetched from the ttl
   * @property besluitType
   * @type BesluitType Array
   * @private
   */
  @reads('args.info.besluitTypes')
  besluitTypes;

  @tracked
  hasSelected;

  constructor(...args) {
    super(...args);
    this.hasSelected = !!this.args.info.besluitType;
  }
  @action
  updateBesluitType(selected) {
    const besluitType = selected;
    this.besluitType = besluitType;
  }

  @action
  insert() {
    this.hintsRegistry.removeHintsAtLocation(this.location, this.hrId, this.who);

    this.hasSelected = true;
    let newTypeOfs = null;
    const oldBesluitType = this.args.info.besluitTypeOfs.filter(type => type.includes('https://data.vlaanderen.be/id/concept/BesluitType/')).firstObject;

    if (oldBesluitType) {
      newTypeOfs = this.args.info.besluitTypeOfs.map(type => {
        if (type == oldBesluitType) {
          return this.besluitType.typeAttribute;
        } else {
          return type;
        }
      });
    } else {
      newTypeOfs = this.args.info.besluitTypeOfs;
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
    const hiddenSelection = this.editor.selectContext(this.location, {
      property: "http://mu.semte.ch/vocabularies/ext/hiddenBesluitType"
    });
    if (!this.editor.isEmpty(hiddenSelection)) { // We already have a hidden span in the document, we only need to change its content
      this.editor.update(hiddenSelection, {
        set: {
          innerHTML: this.besluitType.typeAttribute
        }
      });
    } else { // We add the span into the decision
      const selectionForSpan = this.editor.selectContext(this.location, { // We need to reselect for the case where the previous selection has changed
        resource: this.besluitUri
      });
      this.editor.update(selectionForSpan, {
        prepend: {
          innerHTML: `<span class="u-hidden" property="ext:hiddenBesluitType">${this.besluitType.typeAttribute}</span>`
        }
      });
    }
  }
}
