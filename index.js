import fxparser from 'fast-xml-parser'
import Ajv2019 from "ajv/dist/2019"

import catalogueSchema from './catalogue.schema.json'
import gameSystemSchema from './gameSystem.schema.json'
import sharedSchema from './shared.schema.json'

const ajv = new Ajv2019({allErrors: true, allowUnionTypes: true, coerceTypes: true})
ajv.addSchema(sharedSchema, 'shared.schema.json')
ajv.addSchema(gameSystemSchema, 'gameSystem.schema.json')
ajv.addSchema(catalogueSchema, 'catalogue.schema.json')

export const validateCatalogue = (catalogue) => {
  const validate = ajv.getSchema('catalogue.schema.json')
  if (!validate(catalogue)) {
    return validate.errors
  }
}

export const validateGameSystem = (gameSystem) => {
  const validate = ajv.getSchema('gameSystem.schema.json')
  if (!validate(gameSystem)) {
    return validate.errors
  }
}

const containerTags = {
  catalogueLinks: "catalogueLink",
  categoryEntries: "categoryEntry",
  categoryLinks: "categoryLink",
  characteristics: "characteristic",
  characteristicTypes: "characteristicType",
  conditions: "condition",
  conditionGroups: "conditionGroup",
  constraints: "constraint",
  costs: "cost",
  costTypes: "costType",
  entryLinks: "entryLink",
  forceEntries: "forceEntry",
  infoGroups: "infoGroup",
  infoLinks: "infoLink",
  modifiers: "modifier",
  modifierGroups: "modifierGroup",
  profiles: "profile",
  profileTypes: "profileType",
  publications: "publication",
  repeats: "repeat",
  rules: "rule",
  selectionEntries: "selectionEntry",
  selectionEntryGroups: "selectionEntryGroup",
  sharedInfoGroups: "infoGroup",
  sharedProfiles: "profile",
  sharedRules: "rule",
  sharedSelectionEntries: "selectionEntry",
  sharedSelectionEntryGroups: "selectionEntryGroup",
}

const escapedHtml = /&(?:amp|lt|gt|quot|#39|apos);/g
const htmlUnescapes = {
  '&amp;': '&',
  '&apos;': "'",
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'"
};

const unescape = string => escapedHtml.test(string) ? string.replace(escapedHtml, match => htmlUnescapes[match]) : string

const parser = new fxparser.XMLParser({
  allowBooleanAttributes: true,
  attributeNamePrefix: '',
  ignoreAttributes: false,
  ignoreDeclaration: true,
  parseAttributeValue: true,
  parseTagValue: false,
  processEntities: false,
  attributeValueProcessor: (name, val) => unescape(val),
  tagValueProcessor: (name, val) => unescape(val),
  isArray: (name, jpath) => {
    const pieces = jpath.split('.')

    const last = pieces.pop()
    const secondLast = pieces.pop()

    // Use match for the case of 'sharedSelectionEntries.selectionEntry'
    return secondLast && containerTags[secondLast] === last
  }
})

function normalize(x) {
  delete x.import

  for (let attr in x) {
    if (x[attr] === '') {
      delete x[attr]
    } else if (containerTags[attr] && x[attr][containerTags[attr]]) {
      x[attr] = x[attr][containerTags[attr]]
      x[attr].forEach(normalize)
    }
  }
}

export const parseXML = (xmlString, validate = true) => {
  let data = parser.parse(xmlString)

  if (data.catalogue) {
    const catalogue = {
      type: 'catalogue',
      ...data.catalogue,
    }
    delete catalogue.xmlns

    normalize(catalogue)
    if (validate) {
      const errors = validateCatalogue(catalogue)
      if (errors) { throw errors }
    }
    return catalogue
  } else if (data.gameSystem) {
    const gameSystem = {
      type: 'gameSystem',
      ...data.gameSystem,
    }
    delete gameSystem.xmlns

    normalize(gameSystem)
    if (validate) {
      const errors = validateGameSystem(gameSystem)
      if (errors) { throw errors }
    }
    return gameSystem
  } else {
    throw new Error('xml did not contain a <catalogue> or <gameSystem> element at the top level.')
  }
}

export const parseJSON = (jsonString) => {
  const data = JSON.parse(jsonString)

  if (data.type === 'catalogue') {
    validateCatalogue(data)
  } else if (data.type === 'gameSystem') {
    validateGameSystem(data)
  } else {
    throw new Error(`data does not have a valid "type" at the top level. Type was "${data.type}", must be one of "catalogue" or "gameSystem".`)
  }

  return data
}
