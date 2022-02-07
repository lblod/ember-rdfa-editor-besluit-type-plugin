// import Service from '@ember/service';
// import EmberObject from '@ember/object';
// import { task, waitForProperty } from 'ember-concurrency';
// import fetchBesluitTypes from '../utils/fetchBesluitTypes';
// import { inject as service } from '@ember/service';
// import { tracked } from '@glimmer/tracking';
// /**
//  * Service responsible for correct annotation of dates
//  *
//  * @module editor-besluit-type-plugin
//  * @class RdfaEditorBesluitTypePlugin
//  * @constructor
//  * @extends EmberService
//  */
// class RdfaEditorBesluitTypePlugin extends Service {
//   @service currentSession;
//   @tracked types = null;
//   constructor() {
//     super(...arguments);
//     this.loadData.perform();
//   }

//   @task
//   *loadData() {
//     let bestuurseenheid = yield this.currentSession.get('group');
//     const classificatie = yield bestuurseenheid.get('classificatie');
//     const types = yield fetchBesluitTypes(classificatie.uri);
//     this.types = types;
//   }

//   /**
//    * task to handle the incoming events from the editor dispatcher
//    *
//    * @method execute
//    *
//    * @param {string} hrId Unique identifier of the event in the hintsRegistry
//    * @param {Array} contexts RDFa contexts of the text snippets the event applies on
//    * @param {Object} hintsRegistry Registry of hints in the editor
//    * @param {Object} editor The RDFa editor instance
//    *
//    * @public
//    */
//   @task
//   *execute(hrId, rdfaBlocks, hintsRegistry, editor) {
//     yield waitForProperty(this, 'types', (types) => types?.length);
//     if (rdfaBlocks.length === 0) return [];
//     let hints = [];

//     const uniqueRichNodes = editor.findUniqueRichNodes(rdfaBlocks, {
//       typeof: 'http://data.vlaanderen.be/ns/besluit#Besluit',
//     });

//     uniqueRichNodes.forEach((richNode) => {
//       hintsRegistry.removeHintsInRegion(richNode.region, hrId, this.who);
//       hints.pushObjects(this.generateHintsForContext(richNode));
//     });

//     const cards = hints.map((hint) =>
//       this.generateCard(hrId, hintsRegistry, editor, hint)
//     );

//     if (cards.length > 0) {
//       hintsRegistry.addHints(hrId, this.who, cards);
//     }

//     yield 0;
//   }

//   /**
//    * Generates a card given a hint
//    *
//    * @method generateCard
//    *
//    * @param {string} hrId Unique identifier of the event in the hintsRegistry
//    * @param {Object} hintsRegistry Registry of hints in the editor
//    * @param {Object} editor The RDFa editor instance
//    * @param {Object} hint containing the hinted string and the location of this string
//    *
//    * @return {Object} The card to hint for a given template
//    *
//    * @private
//    */
//   generateCard(hrId, hintsRegistry, editor, hint) {
//     return EmberObject.create({
//       info: {
//         label: this.who,
//         plainValue: hint.text,
//         htmlString: '',
//         location: hint.location,
//         besluitUri: hint.uri,
//         besluitTypeOfs: hint.besluitTypeOfs,
//         besluitType: hint.besluitType,
//         besluitTypes: this.types,
//         hrId,
//         hintsRegistry,
//         editor,
//       },
//       location: hint.location,
//       card: this.who,
//       options: { noHighlight: true },
//     });
//   }

//   /**
//    * Generates a hint, given a context
//    *
//    * @method generateHintsForContext
//    *
//    * @param {Object} context Text snippet at a specific location with an RDFa context
//    *
//    * @return {Object} [{dateString, location}]
//    *
//    * @private
//    */
//   generateHintsForContext(besluit) {
//     const hints = [];
//     const uri = besluit.rdfaAttributes.resource;
//     const typeofAttr = besluit.rdfaAttributes.typeof;
//     const besluitTypeUri = typeofAttr.find((type) =>
//       type.includes('https://data.vlaanderen.be/id/concept/BesluitType/')
//     );
//     const besluitType =
//       besluitTypeUri && this.findBesluitTypeByURI(besluitTypeUri);

//     hints.push({
//       besluitType: besluitType,
//       location: besluit.region,
//       besluitTypeOfs: besluit.rdfaAttributes.typeof,
//       uri,
//     });
//     return hints;
//   }

//   findBesluitTypeByURI(uri, types = this.types) {
//     if (uri) {
//       for (const besluitType of types) {
//         if (besluitType.uri === uri) {
//           return besluitType;
//         } else if (besluitType.subTypes.length) {
//           const subType = this.findBesluitTypeByURI(uri, besluitType.subTypes);
//           console.log(subType);
//           if (subType) {
//             return subType;
//           }
//         }
//       }
//     }
//     return null;
//   }
// }

// RdfaEditorBesluitTypePlugin.reopen({
//   who: 'editor-plugins/besluit-type-card',
// });
// export default RdfaEditorBesluitTypePlugin;
