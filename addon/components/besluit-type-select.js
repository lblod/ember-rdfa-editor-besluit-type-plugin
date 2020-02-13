import Component from '@ember/component';
import layout from '../templates/components/besluit-type-select';

export default Component.extend({
  layout,
  selected: null,
  actions: {
    search(term){
      return this.besluitTypes.filter((besluitType) => besluitType.label.includes(term));
    },
  }
});
