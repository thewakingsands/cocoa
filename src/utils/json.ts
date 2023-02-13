export const tryParseJson = <T>(
  str: string | null | undefined,
): T | undefined => {
  if (!str) {
    return undefined
  }
  try {
    return JSON.parse(str || '')
  } catch (e) {
    return undefined
  }
}
