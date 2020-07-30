export const getRandomItemFromList = <T>(items: T[]): T => {
  return items[Math.floor(Math.random() * items.length)]
}

export const generateRandomSentence = (): string => {
  return `This sentence is random: ${Math.random()}`
}