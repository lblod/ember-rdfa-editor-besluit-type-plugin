import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class BesluitTypeSelectComponent extends Component {
  constructor() {
    super(...arguments);
    this.selected = null;
    this.besluitTypes = this.args.besluitTypes
      ? this.args.besluitTypes.sortBy('label')
      : [];
  }

  @action
  search(term) {
    return this.args.besluitTypes.filter((besluitType) =>
      besluitType.label.toLowerCase().includes(term.toLowerCase())
    );
  }
}
