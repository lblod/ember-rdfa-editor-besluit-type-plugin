import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class BesluitTypeSelectComponent extends Component {
  constructor() {
    super(...arguments);
    this.selected = null;
  }

  @action
  search(term) {
    return this.besluitTypes.filter((besluitType) => besluitType.label.includes(term));
  }
}
