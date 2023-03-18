import { MAIN_LANGUAGE } from '../../common/constant'
import { getImagePath } from '../../helper'
import { simpleReadSheet } from '../reader/simple'
import { SheetFormatterFactory } from './interface'

const getJournalGenreIcon = (() => {
  const map: Record<string, string> = {}
  for (const { row } of simpleReadSheet('JournalGenre', MAIN_LANGUAGE)) {
    map[row.ID as string] = row.Icon as string
  }

  return (id: string) => {
    return map[id]
  }
})()

const getItemIcon = (() => {
  const map: Record<string, string> = {}
  for (const { row } of simpleReadSheet('Item', MAIN_LANGUAGE)) {
    map[row.ID as string] = row.Icon as string
  }

  return (id: string) => {
    return map[id]
  }
})()

const staticIcons: Record<string, string | ((row: Record<string, any>) => void)> = {
  // Icons
  BNpcName: '/c/BNpcName.png',
  ENpcResident: '/c/ENpcResident.png',
  Leve: '/c/Leve.png',
  PlaceName: '/c/PlaceName.png',
  Title: '/c/Title.png',
  ClassJob(row) {
    const name: string = row.Name_en
    row.Icon = `/cj/1/${name.toLowerCase().replace(/ /g, '')}.png`
  },
  Companion(row) {
    row.IconSmall = row.Icon
    row.Icon = row.Icon.replace('/004', '/068').replace('/008', '/077')
  },
  Mount(row) {
    row.IconSmall = row.Icon
    row.Icon = row.Icon.replace('/004', '/068').replace('/008', '/077')
  },
  Ornament(row) {
    row.IconSmall = row.Icon
    row.Icon = row.Icon.replace('/008', '/067')
  },

  // Fate
  Fate(row) {
    const icons: Record<string, string> = {
      '60501': '/f/060501.png',
      '60502': '/f/060502.png',
      '60503': '/f/060503.png',
      '60504': '/f/060504.png',
      '60505': '/f/060505.png',
    }

    row.Icon = icons[row.IconMap] ?? '/f/fate.png'
  },

  // Maps
  Map(row) {
    const id: string | undefined = row.Id_chs || row.Id
    if (typeof id === 'undefined') return
    delete row.Id_chs
    delete row.Id

    row.MapFilename = null
    row.MapFilenameId = id

    if (id) {
      const [folder, layer] = id.split('/')
      row.MapFilename = `/m/${folder}/${folder}.${layer}.jpg`
    }
  },

  // Quest
  Quest(row) {
    row.Banner = row.Icon
    row.IconID = 71221
    row.Icon = getImagePath(71221)
    row.IconSmall = row.Icon

    // if there is a special icon, use that
    if (row.IconSpecial) {
      row.IconSmall = row.Icon
      row.Icon = row.IconSpecial
      row.IconID = row.IconSpecialID
    } else {
      // Use journal icon if it exists
      const journalIcon = getJournalGenreIcon(row.JournalGenre)
      if (journalIcon) {
        // tweak some journal icons to higher res versions
        const idMap: Record<string, string> = {
          '61411': '71221',
          '61412': '71201',
          '61413': '71222',
          '61414': '71281',
          '61415': '60552',
          '61416': '61436',

          // grand companies
          '61401': '62951', // limsa
          '61402': '62952', // grid
          '61403': '62953', // uldah
        }

        row.IconID = idMap[journalIcon] ?? journalIcon
        row.Icon = getImagePath(row.IconID)
      }
    }
  },

  // Recipe
  Recipe(row) {
    const icon = getItemIcon(row.ItemResult)

    row.IconID = icon
    row.Icon = getImagePath(row.IconID)
  },
}

export const iconFormatter: SheetFormatterFactory = (def) => {
  const icon = staticIcons[def]
  if (typeof icon === 'string') {
    return (row) => {
      row.Icon = icon
    }
  } else if (typeof icon === 'function') {
    return icon
  }

  return null
}
