import rdflib from 'ember-rdflib';

const DECIDABLE_BY = new rdflib.NamedNode(
  'http://lblod.data.gift/vocabularies/besluit/decidableBy'
);
const SKOS_PREFLABEL = new rdflib.NamedNode(
  'http://www.w3.org/2004/02/skos/core#prefLabel'
);
const SKOS_BROADER = new rdflib.NamedNode(
  'http://www.w3.org/2004/02/skos/core#broader'
);
const SKOS_TOP_CONCEPT_OF = new rdflib.NamedNode(
  'http://www.w3.org/2004/02/skos/core#topConceptOf'
);
const TYPE_CONCEPT_SCHEME = new rdflib.NamedNode(
  'https://data.vlaanderen.be/id/conceptscheme/BesluitType'
);

async function readUrlIntoGraph(url) {
  const besluitTypesGraph = new rdflib.NamedNode(
    'http://data.lblod.info/besluitTypes'
  );
  const response = await fetch(url);
  const text = await response.text();
  const graph = rdflib.graph();
  await rdflib.parse(text, graph, besluitTypesGraph.value, 'text/turtle');
  return graph;
}

function findConceptsDecidableBy(graph, classificationUri) {
  const classification = new rdflib.NamedNode(classificationUri);
  const dataset = graph.match(null, SKOS_TOP_CONCEPT_OF, TYPE_CONCEPT_SCHEME);
  return dataset
    .filter((triple) =>
      graph.holds(triple.subject, DECIDABLE_BY, classification)
    )
    .map((triple) => triple.subject);
}

function findPreflabel(graph, concept) {
  return graph.anyValue(concept, SKOS_PREFLABEL, null);
}

function getSubTypes(graph, uriNode /*, classificationUri */) {
  const dataset = graph.match(null, SKOS_BROADER, uriNode);
  if (dataset.length === 0) {
    return [];
  } else {
    const relevantTypes = dataset;
    // TODO: seems like this is not defined on subtypes
    // .filter((triple) => graph.holds(triple.subject, DECIDABLE_BY, new rdflib.NamedNode(classificationUri)));
    return relevantTypes.map((triple) => {
      const uri = triple.subject;
      return {
        uri: uri.value,
        label: findPreflabel(graph, uri),
        subTypes: getSubTypes(graph, uri),
      };
    });
  }
}

export default async function fetchBesluitTypes(classificatieUri) {
  const graph = await readUrlIntoGraph(
    '/assets/ttl/20210205102900-new-besluit-types.ttl'
  );
  const relevantConcepts = findConceptsDecidableBy(graph, classificatieUri);
  return relevantConcepts.map((concept) => {
    return {
      label: findPreflabel(graph, concept),
      uri: concept.value,
      subTypes: getSubTypes(graph, concept, classificatieUri),
    };
  });
}
