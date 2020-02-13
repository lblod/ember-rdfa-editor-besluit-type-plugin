import Component from '@glimmer/component';
import layout from '../templates/components/besluit-type-select';
import { action } from '@ember/object';

export default class BesluitTypeSelectComponent extends Component {
  constructor() {
    super(...arguments)
    this.layout = layout;
    this.selected = null
  }

  @action
  search(term){
    return this.besluitTypes.filter((besluitType) => besluitType.label.includes(term));
  }
}
