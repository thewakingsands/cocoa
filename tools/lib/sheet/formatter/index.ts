import { descriptionFormatter } from './description'
import { iconFormatter } from './icon'
import { patchFormatter } from './patch'
import { placeNameFormatter } from './placename'

export const formatters = [
  descriptionFormatter,
  iconFormatter,
  patchFormatter,
  // php /vagrant/bin/console SaintCoinachRedisCustomCommand Quest
  // php /vagrant/bin/console SaintCoinachRedisCustomCommand Recipe
  // php /vagrant/bin/console SaintCoinachRedisCustomCommand Achievement
  // php /vagrant/bin/console SaintCoinachRedisCustomCommand InstanceContent
  // php /vagrant/bin/console SaintCoinachRedisCustomCommand Item
  // php /vagrant/bin/console SaintCoinachRedisCustomCommand ItemAction
  // php /vagrant/bin/console SaintCoinachRedisCustomCommand LogMessage
  // php /vagrant/bin/console SaintCoinachRedisCustomCommand Materia
  // php /vagrant/bin/console SaintCoinachRedisCustomCommand NPC
  // php /vagrant/bin/console SaintCoinachRedisCustomCommand Orchestrion
  placeNameFormatter,
  // php /vagrant/bin/console SaintCoinachRedisCustomCommand Servers
  // php /vagrant/bin/console SaintCoinachRedisCustomCommand Stain
  // php /vagrant/bin/console SaintCoinachRedisCustomCommand Characters
  // php /vagrant/bin/console SaintCoinachRedisCustomCommand CraftLeve
  // php /vagrant/bin/console SaintCoinachRedisCustomCommand Leve
  // php /vagrant/bin/console SaintCoinachRedisCustomCommand Links
]
