import { tracked } from '@glimmer/tracking';
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
  get location() {
    return this.args.info.location;
  }

  /**
   * The RDFa editor instance
   * @property editor
   * @type RdfaEditor
   * @private
   */
  get editor() {
    return this.args.info.editor;
  }

  /**
   * URI of the besluit we are interacting with
   * @property besluitUri
   * @type String
   * @private
   */
  get besluitUri() {
    return this.args.info.besluitUri;
  }

  /**
   * Actual besluit type selected
   * @property besluitType
   * @type BesluitType
   * @private
   */
  @tracked besluitType;

  //used to update selections since the other vars dont seem to work in octane
  @tracked besluit;
  @tracked subBesluit;
  @tracked subSubBesluit;

  /**
   * Array of Besluit types fetched from the ttl
   * @property besluitType
   * @type BesluitType Array
   * @private
   */
  get besluitTypes() {
    return this.args.info.besluitTypes;
  }

  @tracked
  cardExpanded = true;
  @tracked
  hasSelected = false;

  constructor(...args) {
    super(...args);
    if (this.args.info.besluitType) {
      this.besluitType = this.args.info.besluitType;
      const firstAncestor = this.findBesluitTypeParent(
        this.args.info.besluitType
      );
      const secondAncestor = this.findBesluitTypeParent(firstAncestor);
      if (firstAncestor && secondAncestor) {
        this.besluit = secondAncestor;
        this.subBesluit = firstAncestor;
        this.subSubBesluit = this.args.info.besluitType;
      } else if (firstAncestor) {
        this.besluit = firstAncestor;
        this.subBesluit = this.args.info.besluitType;
      } else {
        this.besluit = this.args.info.besluitType;
      }
      this.hasSelected = true;
      this.cardExpanded = false;
    }
  }
  @action
  updateBesluitType(selected) {
    this.besluit = selected;
    this.besluitType = selected;
    this.subBesluit = null;
    this.subSubBesluit = null;
    if (!selected.subTypes.length) {
      this.insert();
    }
  }
  @action
  updateBesluitSubType(selected) {
    this.subBesluit = selected;
    this.besluitType = selected;
    this.subSubBesluit = null;
    if (!selected.subTypes.length) {
      this.insert();
    }
  }
  @action
  updateBesluitSubSubType(selected) {
    this.subSubBesluit = selected;
    this.besluitType = selected;
    if (!selected.subTypes.length) {
      this.insert();
    }
  }

  findBesluitTypeParent(besluitType, array = this.besluitTypes, parent = null) {
    if (!besluitType) {
      return null;
    }
    for (let i = 0; i < array.length; i++) {
      if (array[i] == besluitType) {
        return parent;
      } else if (array[i].subTypes.length) {
        parent = array[i];
        return this.findBesluitTypeParent(
          besluitType,
          array[i].subTypes,
          parent
        );
      }
    }
    return null;
  }

  insert() {
    this.hasSelected = true;
    this.cardExpanded = false;
    let newTypeOfs = null;
    const oldBesluitType = this.args.info.besluitTypeOfs.filter((type) =>
      type.includes('https://data.vlaanderen.be/id/concept/BesluitType/')
    ).firstObject;
    if (oldBesluitType) {
      newTypeOfs = this.args.info.besluitTypeOfs.map((type) => {
        if (type == oldBesluitType) {
          return this.besluitType.uri;
        } else {
          return type;
        }
      });
    } else {
      newTypeOfs = this.args.info.besluitTypeOfs;
      newTypeOfs.push(this.besluitType.uri);
    }

    const selection = this.editor.selectContext(this.location, {
      resource: this.besluitUri,
    });

    this.editor.update(selection, {
      set: {
        typeof: newTypeOfs,
      },
    });

    // Trick: add invisible text to trigger the execute service again // WIP on the editor
    const hiddenSelection = this.editor.selectContext(this.location, {
      property: 'http://mu.semte.ch/vocabularies/ext/hiddenBesluitType',
    });
    if (!this.editor.isEmpty(hiddenSelection)) {
      // We already have a hidden span in the document, we only need to change its content
      this.editor.update(hiddenSelection, {
        set: {
          innerHTML: this.besluitType.uri,
        },
      });
    } else {
      // We add the span into the decision
      const selectionForSpan = this.editor.selectContext(this.location, {
        // We need to reselect for the case where the previous selection has changed
        resource: this.besluitUri,
      });
      this.editor.update(selectionForSpan, {
        prepend: {
          innerHTML: `<span class="u-hidden" property="ext:hiddenBesluitType">${this.besluitType.uri}</span>`,
        },
      });
    }
  }
  @action
  toggleCard() {
    this.cardExpanded = !this.cardExpanded;
  }
}
