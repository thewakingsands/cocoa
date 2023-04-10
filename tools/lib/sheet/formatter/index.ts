import { craftLeveFormatter } from './craft-leve'
import { definitionFormatter } from './definition'
import { descriptionFormatter } from './description'
import { iconFormatter } from './icon'
import { itemFormatter } from './item'
import { leveFormatter } from './leve'
import { materiaFormatter } from './materia'
import { orchestrionFormatter } from './orchestrion'
import { patchFormatter } from './patch'
import { placeNameFormatter } from './placename'
import { stainFormatter } from './stain'
import { worldFormatter } from './world'
// import { achievementFormatter } from './achievement'
// import { instanceContentFormatter } from './instance-content'

export const formatters = [
  definitionFormatter,

  // SaintCoinachRedisCustomCommand
  descriptionFormatter,
  iconFormatter,
  patchFormatter,
  // php /vagrant/bin/console SaintCoinachRedisCustomCommand Quest
  // php /vagrant/bin/console SaintCoinachRedisCustomCommand Recipe
  // achievementFormatter,
  // instanceContentFormatter,
  itemFormatter,
  // php /vagrant/bin/console SaintCoinachRedisCustomCommand ItemAction
  materiaFormatter,
  // php /vagrant/bin/console SaintCoinachRedisCustomCommand NPC
  orchestrionFormatter,
  placeNameFormatter,
  worldFormatter,
  stainFormatter,
  // I don't know what this does
  // php /vagrant/bin/console SaintCoinachRedisCustomCommand Characters
  craftLeveFormatter,
  leveFormatter,
  // php /vagrant/bin/console SaintCoinachRedisCustomCommand Links
]
