import { SparqlEndpointFetcher } from 'fetch-sparql-endpoint';

export default async function fetchBesluitTypes(classificationUri, ENV) {
  const query = `
    PREFIX                    conceptscheme: <https://data.vlaanderen.be/id/conceptscheme/>
    PREFIX                      BesluitType: <https://data.vlaanderen.be/id/concept/BesluitType/>
    PREFIX              BesluitDocumentType: <https://data.vlaanderen.be/id/concept/BesluitDocumentType/>
    PREFIX                             skos: <http://www.w3.org/2004/02/skos/core#>
    PREFIX                              xsd: <http://www.w3.org/2001/XMLSchema#>
    PREFIX                              rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX                             core: <http://mu.semte.ch/vocabularies/core/>
    PREFIX                          besluit: <http://lblod.data.gift/vocabularies/besluit/>
    PREFIX BestuurseenheidClassificatieCode: <http://data.vlaanderen.be/id/concept/BestuurseenheidClassificatieCode/>
    PREFIX                              sch: <https://schema.org/>
    PREFIX                             rule: <http://lblod.data.gift/vocabularies/notification/>

    CONSTRUCT {
      ?s skos:inScheme conceptscheme:BesluitType ;
         skos:prefLabel ?label ;
         skos:definition ?definition ;
         skos:broader ?parent .
    }
    WHERE {
      ?s skos:inScheme conceptscheme:BesluitType ;
         besluit:notificationRule ?rule .
      ?rule besluit:decidableBy <${classificationUri}> .
      OPTIONAL { ?rule sch:validFrom ?validFrom . }
      OPTIONAL { ?rule sch:validThrough ?validThrough . }
      BIND(now() AS ?currentTime) .
      BIND(STRLEN(STR(?validFrom)) > 0 AS ?validFromExists) .
      BIND(STRLEN(STR(?validThrough)) > 0 AS ?validThroughExists) .
      FILTER(
        ((?validFromExists && ?validThroughExists) && (?currentTime < ?validThrough && ?currentTime >= ?validFrom)) ||
        ((!?validFromExists && ?validThroughExists) && (?currentTime < ?validThrough)) ||
        ((?validFromExists && !?validThroughExists) && (?currentTime >= ?validFrom))
      ) .
      OPTIONAL { ?s skos:prefLabel ?label . }
      OPTIONAL { ?s skos:definition ?definition . }
      OPTIONAL { ?s skos:broader ?parent . }
    }
  `;
  const typeFetcher = new SparqlEndpointFetcher({
    method: 'POST',
  });
  const endpoint = ENV['besluit-type-plugin']['besluit-types-endpoint'];
  const tripleStream = await typeFetcher.fetchTriples(endpoint, query);
  const validBesluitTriples = [];
  tripleStream.on('data', (triple) => {
    validBesluitTriples.push(triple);
  });
  await new Promise((resolve, reject) => {
    tripleStream.on('error', reject);
    tripleStream.on('end', resolve);
  });
  //Map all the triples to a hierarchical collection of JavaScript objects
  const jsObjects = quadsToBesluitTypeObjects(validBesluitTriples);
  return jsObjects;
}

function quadsToBesluitTypeObjects(quads) {
  const besluitTypes = new Map();
  quads.forEach((quad) => {
    const existing = besluitTypes.get(quad.subject.value) || {
      uri: quad.subject.value,
    };
    switch (quad.predicate.value) {
      case 'http://www.w3.org/2004/02/skos/core#definition':
        existing.definition = quad.object.value;
        break;
      case 'http://www.w3.org/2004/02/skos/core#prefLabel':
        existing.label = quad.object.value;
        break;
      case 'http://www.w3.org/2004/02/skos/core#broader':
        existing.broader = quad.object.value;
        break;
    }
    besluitTypes.set(quad.subject.value, existing);
  });
  return createBesluitTypeObjectsHierarchy([...besluitTypes.values()]);
}

function createBesluitTypeObjectsHierarchy(allBesluitTypes) {
  const besluitTypes = allBesluitTypes.filter((bst) => !bst.broader);
  const subTypes = allBesluitTypes.filter((bst) => !!bst.broader);
  subTypes.forEach((subtype) => {
    //Use allBesluitTypes to find the parent. This means no tree recursive search process, but we can still create trees of multiple levels deep.
    const parent = allBesluitTypes.find((type) => type.uri === subtype.broader);
    if (parent)
      if (parent.subTypes) parent.subTypes.push(subtype);
      else parent.subTypes = [subtype];
  });
  return besluitTypes;
}
