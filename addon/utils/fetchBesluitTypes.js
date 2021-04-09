import rdflib from 'ember-rdflib';
//reglemente as sample
export default async function fetchBesluitTypes(classificatieUri) {
  const besluitTypesGraph = new rdflib.NamedNode("http://data.lblod.info/besluitTypes");
  const response = await fetch('/assets/ttl/20210205102900-new-besluit-types.ttl');
  const text = await response.text();
  const graph = rdflib.graph();
  await rdflib.parse(text, graph, besluitTypesGraph.value, "text/turtle");
  const type = new rdflib.NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
  const conceptPredicate = new rdflib.NamedNode('http://www.w3.org/2004/02/skos/core#Concept');
  const match = graph.match(undefined, type, conceptPredicate);
  let besluitTypes = match.map((typeNode) => {
    const uri = typeNode.subject.value;
    const uuid = uri.split('/').pop();
    const uriNode = new rdflib.NamedNode(uri);

    const decidableByNode = new rdflib.NamedNode('http://lblod.data.gift/vocabularies/besluit/decidableBy');
    const decidableByMatch = graph.match(uriNode, decidableByNode);
    let valid = false;
    for (const match of decidableByMatch) {
      if (match.object.value === classificatieUri) {
        valid = true;
      }
    }
    if (!valid) return;

    const prefLabelNode = new rdflib.NamedNode('http://www.w3.org/2004/02/skos/core#prefLabel');
    const prefLabelMatch = graph.match(uriNode, prefLabelNode);
    const subTypes = getSubTypes(graph, uriNode);
    const result = {
      typeAttribute: `besluittype:${uuid}`,
      label: prefLabelMatch[0].object.value,
      subTypes: subTypes
    };
    return result;
  }).filter(type => type);
  return besluitTypes;
}

function getSubTypes(graph, uriNode) {
  const prefLabelNode = new rdflib.NamedNode('http://www.w3.org/2004/02/skos/core#prefLabel');
  const broader = new rdflib.NamedNode('http://www.w3.org/2004/02/skos/core#broader');

  const subTypesUris = graph.match(undefined, broader, uriNode);
  const subTypeLabels = subTypesUris.map(triple => {
    const uri = new rdflib.NamedNode(triple.subject.value);
    const uuid = triple.subject.value.split('/').pop();
    const subTypeTriple = graph.match(uri, prefLabelNode, undefined);

    const result = {
      typeAttribute: `besluittype:${uuid}`,
      label: subTypeTriple[0].object.value,
      subTypes: []
    };
    //recursive logic for sub-sub-types
    if (getSubTypes(graph, uri).length != 0) {
      result.subTypes = getSubTypes(graph, uri);
    }
    return result;
  });
  return subTypeLabels;
}
