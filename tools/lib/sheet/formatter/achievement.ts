import { SheetFormatterFactory } from './interface'

export const achievementFormatter: SheetFormatterFactory = (def) => {
  if (def !== 'Achievement') {
    return null
  }

  // This is interesting that they intended to implement a bunch of things,
  // but all result in empty arrays.

  // For example:
  // https://xivapi.com/Achievement/129?columns=Type,PreAchievements,PostAchievements,QuestRequirements,ClassJobRequirements,QuestRequirementsAll
  // https://xivapi.com/Achievement/154?columns=Type,PreAchievements,PostAchievements,QuestRequirements,ClassJobRequirements,QuestRequirementsAll
  // https://xivapi.com/Achievement/2313?columns=Type,PreAchievements,PostAchievements,QuestRequirements,ClassJobRequirements,QuestRequirementsAll

  return (row) => {
    row.PreAchievements = []
    row.PostAchievements = []
    row.QuestRequirements = []
    row.ClassJobRequirements = []
    row.QuestRequirementsAll = row.Type === 6
  }
}
