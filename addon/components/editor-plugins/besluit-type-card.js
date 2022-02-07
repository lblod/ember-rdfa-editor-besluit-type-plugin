import { tracked } from '@glimmer/tracking';
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import fetchBesluitTypes from '../../utils/fetchBesluitTypes';
import { inject as service } from '@ember/service';

/**
 * Card displaying a hint of the Date plugin
 *
 * @module editor-besluit-type-plugin
 * @class BesluitTypeCard
 * @extends Ember.Component
 */

export default class BesluitTypeCard extends Component {
  @service currentSession;

  @task
  *loadData() {
    let bestuurseenheid = yield this.currentSession.get('group');
    const classificatie = yield bestuurseenheid.get('classificatie');
    const types = yield fetchBesluitTypes(classificatie.uri);
    this.types = types;
  }

  /**
   * Actual besluit type selected
   * @property besluitType
   * @type BesluitType
   * @private
   */
  @tracked besluitType;
  @tracked types = [];

  //used to update selections since the other vars dont seem to work in octane
  @tracked besluit;
  @tracked subBesluit;
  @tracked subSubBesluit;

  @tracked
  cardExpanded = true;
  @tracked
  hasSelected = false;

  constructor(...args) {
    super(...args);
    this.loadData.perform();
    this.args.controller.onEvent('contentChanged', this.getBesluitType);
  }

  @action
  getBesluitType() {
    const limitedDatastore = this.args.controller.datastore.limitToRange(
      this.args.controller.selection.lastRange,
      'rangeIsInside'
    );
    const besluit = limitedDatastore
      .match(null, 'a', '>http://data.vlaanderen.be/ns/besluit#Besluit')
      .asQuads()
      .next().value;
    if (!besluit) {
      this.showCard = false;
      return;
    }
    const besluitUri = besluit.subject.value;
    const besluitTypes = limitedDatastore
      .match(`>${besluitUri}`, 'a', null)
      .asQuads();
    const besluitTypesUris = [...besluitTypes].map((quad) => quad.object.value);
    const besluitTypeRelevant = besluitTypesUris.find((type) =>
      type.includes('https://data.vlaanderen.be/id/concept/BesluitType/')
    );
    if (besluitTypeRelevant) {
      const besluitType = this.findBesluitTypeByURI(besluitTypeRelevant);
      this.showCard = false;
      const firstAncestor = this.findBesluitTypeParent(besluitType);
      const secondAncestor = this.findBesluitTypeParent(firstAncestor);
      if (firstAncestor && secondAncestor) {
        this.besluit = secondAncestor;
        this.subBesluit = firstAncestor;
        this.subSubBesluit = besluitType;
      } else if (firstAncestor) {
        this.besluit = firstAncestor;
        this.subBesluit = besluitType;
        this.subSubBesluit = undefined;
      } else {
        this.besluit = besluitType;
        this.subBesluit = undefined;
        this.subSubBesluit = undefined;
      }
      this.hasSelected = true;
      this.cardExpanded = false;
      console.log(this.besluit);
    } else {
      this.hasSelected = false;
      this.cardExpanded = true;
      this.besluit = undefined;
      this.subBesluit = undefined;
      this.subSubBesluit = undefined;
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

  findBesluitTypeParent(besluitType, array = this.types, parent = null) {
    if (!besluitType || !array) {
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

  findBesluitTypeByURI(uri, types = this.types) {
    if (uri) {
      for (const besluitType of types) {
        if (besluitType.uri === uri) {
          return besluitType;
        } else if (besluitType.subTypes.length) {
          const subType = this.findBesluitTypeByURI(uri, besluitType.subTypes);
          console.log(subType);
          if (subType) {
            return subType;
          }
        }
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
