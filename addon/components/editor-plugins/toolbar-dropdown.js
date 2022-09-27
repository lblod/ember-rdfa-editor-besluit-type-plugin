import { tracked } from '@glimmer/tracking';
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { getOwner } from '@ember/application';
import fetchBesluitTypes from '../../utils/fetchBesluitTypes';
import { inject as service } from '@ember/service';

export default class EditorPluginsToolbarDropdownComponent extends Component {
  @service currentSession;

  /**
   * Actual besluit type selected
   * @property besluitType
   * @type BesluitType
   * @private
   */
  @tracked besluitType;
  @tracked previousBesluitType;
  @tracked types = [];

  //used to update selections since the other vars dont seem to work in octane
  @tracked besluit;
  @tracked subBesluit;
  @tracked subSubBesluit;

  @tracked cardExpanded = false;
  @tracked showCard = false;

  @tracked loadDataTaskInstance;

  constructor(...args) {
    super(...args);
    this.loadDataTaskInstance = this.loadData.perform();
    this.args.controller.addTransactionDispatchListener(
      this.onTransactionDispatch
    );
  }

  @task
  *loadData() {
    const bestuurseenheid = yield this.currentSession.get('group');
    const classificatie = yield bestuurseenheid.get('classificatie');
    const ENV = getOwner(this).resolveRegistration('config:environment');
    const types = yield fetchBesluitTypes(classificatie.uri, ENV);
    this.types = types;
  }

  modifiesSelection(steps) {
    return steps.some(
      (step) => step.type === 'selection-step' || step.type === 'operation-step'
    );
  }

  @action
  onTransactionDispatch(transaction) {
    if (this.modifiesSelection(transaction.steps)) {
      this.getBesluitType(transaction);
    }
  }

  @action
  getBesluitType(transaction) {
    const limitedDatastore = transaction
      .getCurrentDataStore()
      .limitToRange(transaction.currentSelection.lastRange, 'rangeIsInside');
    const besluit = limitedDatastore
      .match(null, 'a', '>http://data.vlaanderen.be/ns/besluit#Besluit')
      .asQuads()
      .next().value;
    if (!besluit) {
      this.showCard = false;
      return;
    }
    this.showCard = true;
    const besluitUri = besluit.subject.value;
    const besluitTypes = limitedDatastore
      .match(`>${besluitUri}`, 'a', null)
      .asQuads();
    const besluitTypesUris = [...besluitTypes].map((quad) => quad.object.value);
    const besluitTypeRelevant = besluitTypesUris.find((type) =>
      type.includes('https://data.vlaanderen.be/id/concept/BesluitType/')
    );
    this.besluitNode = [
      ...limitedDatastore
        .match(`>${besluitUri}`, 'a', null)
        .asSubjectNodes()
        .next().value.nodes,
    ][0];
    if (besluitTypeRelevant) {
      this.previousBesluitType = besluitTypeRelevant;
      const besluitType = this.findBesluitTypeByURI(besluitTypeRelevant);

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
      this.cardExpanded = false;
    } else {
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
    if (!selected.subTypes || !selected.subTypes.length) this.insert();
  }
  @action
  updateBesluitSubType(selected) {
    this.subBesluit = selected;
    this.besluitType = selected;
    this.subSubBesluit = null;
    if (!selected.subTypes || !selected.subTypes.length) this.insert();
  }
  @action
  updateBesluitSubSubType(selected) {
    this.subSubBesluit = selected;
    this.besluitType = selected;
    if (!selected.subTypes || !selected.subTypes.length) this.insert();
  }

  findBesluitTypeParent(besluitType, array = this.types, parent = null) {
    if (!besluitType || !array) {
      return null;
    }
    for (let i = 0; i < array.length; i++) {
      if (array[i] == besluitType) {
        return parent;
      } else if (array[i].subTypes && array[i].subTypes.length) {
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
        } else if (besluitType.subTypes && besluitType.subTypes.length) {
          const subType = this.findBesluitTypeByURI(uri, besluitType.subTypes);
          if (subType) {
            return subType;
          }
        }
      }
    }
    return null;
  }

  insert() {
    this.cardExpanded = false;
    this.args.controller.perform((tr) => {
      if (this.previousBesluitType) {
        console.log('REMOVE TYPE: ', this.previousBesluitType);
        this.besluitNode = tr.commands.removeType({
          type: this.previousBesluitType,
          element: this.besluitNode,
        });
      }
      this.besluitNode = tr.commands.addType({
        type: this.besluitType.uri,
        element: this.besluitNode,
      });
    });
  }

  @action
  toggleCard() {
    this.cardExpanded = !this.cardExpanded;
  }
}
