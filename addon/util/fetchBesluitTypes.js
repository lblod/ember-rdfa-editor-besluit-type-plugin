import rdflib from 'ember-rdflib';

export default async function fetchBesluitTypes() {
  const besluitTypesGraph = new rdflib.NamedNode("http://data.lblod.info/besluitTypes");
  const response = await fetch('/assets/ttl/20200120153300-insert-besluit-types.ttl')
  const text = await response.text()
  const graph = rdflib.graph()
  await rdflib.parse(text, graph, besluitTypesGraph.value, "text/turtle");
  const type = new rdflib.NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
  const conceptPredicate = new rdflib.NamedNode('http://www.w3.org/2004/02/skos/core#Concept');
  const match = graph.match(undefined, type, conceptPredicate)
  const besluitTypes = match.map((typeNode) => {
    const uri = typeNode.subject.value
    const uuid = uri.split('/').pop()
    const uriNode = new rdflib.NamedNode(uri);
    const prefLabelNode = new rdflib.NamedNode('http://www.w3.org/2004/02/skos/core#prefLabel');
    const prefLabelMatch = graph.match(uriNode, prefLabelNode)
    return {
      typeAttribute: `besluittype:${uuid}`,
      label: prefLabelMatch[0].object.value
    }
  })
  return besluitTypes
}