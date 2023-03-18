import { LANGUAGES, MAIN_LANGUAGE } from '../../common/constant'

export const subLanguages = LANGUAGES.filter((item) => item !== MAIN_LANGUAGE)
export const rowIndexes = {
  name: 1,
  type: 2,
  start: 3,
}
