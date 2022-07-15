import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class BesluitTypeSelectComponent extends Component {
  @tracked besluitTypes;
  constructor() {
    super(...arguments);
    this.besluitTypes = this.args.besluitTypes.sort((a, b) =>
      a.label > b.label ? 1 : -1
    );
  }

  @action
  search(term) {
    const lowerTerm = term.toLowerCase();
    return this.args.besluitTypes.filter((besluitType) =>
      besluitType.label.toLowerCase().includes(lowerTerm)
    );
  }
}
