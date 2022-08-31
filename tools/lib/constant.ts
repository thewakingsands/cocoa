export const FOREIGN_REMOVALS = [
  '<Emphasis>', '</Emphasis>', '<Emphasis/>',
  '<Indent>', '</Indent>', '<Indent/>',
  '<SoftHyphen/>'
]

export const LANGUAGES = ['chs', 'de', 'en', 'fr', 'ja']

export const MAIN_LANGUAGE = 'chs'

export const ZERO_CONTENT = [
  'ExVersion',
  'GatheringType',
  'CraftType',
  'Cabinet',
  'World',
  'RecipeNotebookList',
  'SpearFishingNotebook',
  'RetainerTaskParameter'
];

/**
 * Convert some columns into a more standard approach,
 * this is mainly for names.
 */
export const COLUMN_NAMES: Record<string, Record<string, string>> = {
  'Aetheryte': {
    'Singular': 'Name'
  },
  'BNpcName': {
    'Singular': 'Name'
  },
  'ENpcResident': {
    'Singular': 'Name'
  },
  'Mount': {
    'Singular': 'Name'
  },
  'Companion': {
    'Singular': 'Name'
  },
  'Title': {
    'Masculine': 'Name',
    'Feminine': 'NameFemale'
  },
  'Race': {
    'Masculine': 'Name',
    'Feminine': 'NameFemale'
  },
  'Tribe': {
    'Masculine': 'Name',
    'Feminine': 'NameFemale'
  },
  'Quest': {
    'Id': 'TextFile',
  },
  'EurekaAetherItem': {
    'Singular': 'Name'
  },
  'GCRankGridaniaFemaleText': {
    'Singular': 'Name'
  },
  'GCRankGridaniaMaleText': {
    'Singular': 'Name'
  },
  'GCRankLimsaFemaleText': {
    'Singular': 'Name'
  },
  'GCRankLimsaMaleText': {
    'Singular': 'Name'
  },
  'GCRankUldahFemaleText': {
    'Singular': 'Name'
  },
  'GCRankUldahMaleText': {
    'Singular': 'Name'
  },
  'Ornament': {
    'Singular': 'Name'
  }
};