This repository contains JSON schemas describing BattleScribe-compatible data files. It is primarily of interest to tool-authors, rather than everyday users.

This is a *description of the existing data format*, with minimal work done to convert it from from XML to JSON. It also includes a reference implementation in Javascript for converting XML -> JSON and validating JSON against the schemas.

## Example Usage

```
let system = fs.readFileSync("./Warhammer 40,000.gst")
system = parseXML(system.toString(), true)

let catalogue = fs.readFileSync("./T'au Empire.cat")
catalogue = parseXML(catalogue.toString(), true)

console.log(system.type) // gameSystem
console.log(system.forceEntries[0].name) // Patrol Detachment -2CP

console.log(catalogue.type) // catalogue
console.log(catalogue.categoryEntries[107].name) // Kroot Farstalkers
```

## Available JSON

bsd-schemas makes available a number of useful json files for working with battlescribe-compatible data files.

### gameSystem.schema.json / catalogue.schema.json

These two files describe the format of of battlescribe-compatible XML files, as parsed into JSON. See `parseXML` / `parseJSON` or the example usage above.

### shared.schema.json

Contains definitions needed to make sense of other schema files in the repository. Used alongside `gameSystem.schema.json` and `catalogue.schema.json`.

### containerTags.json

`containerTags.json` is a file mapping xml containers with the tags they contain in Battlescribe-compatible documents. Eg:

```
{
  categories: 'category',
  sharedSelectionEntries: 'selectionEntry',
  ...etc...
}
```

describes the fact that in BSD, the format is
```
<categories>
  <category ...>
  <category ...>
  <category ...>
</categories>
```

This is used internally by the reference implementation, and exported in case other projects find the list useful in some way.


## API

The reference implementation exports the following functions:

### parseXML(xmlString: string, validate: boolean = true)

`validateCatalogue` accepts a `string` representing raw XML, and returns a parsed `object` representing the data it held. If `validate` is true (default), then it will throw an error if the data fails `validateCatalogue` / `validateGameSystem`.

### parseJSON(xmlString: string, validate: boolean = true)

`validateCatalogue` accepts a `string` representing raw JSON, and returns a parsed `object` representing the data it held. If `validate` is true (default), then it will throw an error if the data fails `validateCatalogue` / `validateGameSystem`.

### validateCatalogue(catalogue: object)

`validateCatalogue` accepts a javascript object, and returns either `undefined`, indicating the catalogue matches the schema, or an array of errors.

### validateGameSystem(catalogue: object)

`validateGameSystem` accepts a javascript object, and returns either `undefined`, indicating the gameSystem matches the schema, or an array of errors.

In addition, it exports the following constants:

