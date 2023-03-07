export const FOREIGN_REMOVALS = [
  '<Emphasis>',
  '</Emphasis>',
  '<Emphasis/>',
  '<Indent>',
  '</Indent>',
  '<Indent/>',
  '<SoftHyphen/>',
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
  'RetainerTaskParameter',
]

/**
 * Convert some columns into a more standard approach,
 * this is mainly for names.
 */
export const COLUMN_NAMES: Record<string, Record<string, string>> = {
  Aetheryte: {
    Singular: 'Name',
  },
  BNpcName: {
    Singular: 'Name',
  },
  ENpcResident: {
    Singular: 'Name',
  },
  Mount: {
    Singular: 'Name',
  },
  Companion: {
    Singular: 'Name',
  },
  Title: {
    Masculine: 'Name',
    Feminine: 'NameFemale',
  },
  Race: {
    Masculine: 'Name',
    Feminine: 'NameFemale',
  },
  Tribe: {
    Masculine: 'Name',
    Feminine: 'NameFemale',
  },
  Quest: {
    Id: 'TextFile',
  },
  EurekaAetherItem: {
    Singular: 'Name',
  },
  GCRankGridaniaFemaleText: {
    Singular: 'Name',
  },
  GCRankGridaniaMaleText: {
    Singular: 'Name',
  },
  GCRankLimsaFemaleText: {
    Singular: 'Name',
  },
  GCRankLimsaMaleText: {
    Singular: 'Name',
  },
  GCRankUldahFemaleText: {
    Singular: 'Name',
  },
  GCRankUldahMaleText: {
    Singular: 'Name',
  },
  Ornament: {
    Singular: 'Name',
  },
}


export const ELASTICSEARCH_LIST = [
  'Achievement',
  'Title',
  'Action',
  'CraftAction',
  'Trait',
  'PvPAction',
  'PvPTrait',
  'Status',
  'BNpcName',
  'ENpcResident',
  'Companion',
  'Mount',
  'Leve',
  'Emote',
  'InstanceContent',
  'Item',
  'Recipe',
  'Fate',
  'Quest',
  'ContentFinderCondition',

  // non default
  'Balloon',
  'BuddyEquip',
  'Orchestrion',
  'PlaceName',
  'Weather',
  'World',
  'Map',
]

export const clearCommand =
  "local keys = redis.call('keys', ARGV[1]) \n for i=1,#keys,5000 do \n redis.call('del', unpack(keys, i, math.min(i+4999, #keys))) \n end \n return keys"

// Description parsing
export const PLAYER_PARAMETER: Record<string, string> = {
  0: 'reset',
  1: 'reset_bold',
  4: 'is_woman',
  5: 'action_target_is_woman',

  11: 'in_game_hours',
  12: 'in_game_minutes',
  13: 'say_color',
  14: 'shout_color',
  15: 'tell_color',
  16: 'party_color',
  18: 'linkshell_1_color',
  19: 'linkshell_2_color',
  20: 'linkshell_3_color',
  21: 'linkshell_4_color',
  22: 'linkshell_5_color',
  23: 'linkshell_6_color',
  24: 'linkshell_7_color',
  25: 'linkshell_8_color',
  26: 'free_company_color',
  30: 'custom_emotes_color',
  31: 'standard_emotes_color',

  68: 'class_job_id',
  69: 'class_job_level',
  70: 'starting_city_id',
  71: 'race',
  72: 'class_job_level',

  216: 'milliseconds',
  217: 'seconds',
  218: 'minutes',
  219: 'hours',
  220: 'day',
  221: 'week_day',
  222: 'month',
  223: 'year',
  224: '>=',
  225: '>',
  226: '<=',
  227: '<',
  228: '==',
  229: '!=',
  235: 'color',
  236: 'reset_color',
}

export const DESCRIPTION_COMPARE_FUNCTION: Record<string, string> = {
  GreaterThanOrEqualTo: '>=',
  LessThanOrEqualTo: '<=',
  NotEqual: '!=',
  Equal: '==',
}
