import Container from 'typedi'
import { DataItemService } from '../../src/service/data-item'
import { item12345 } from './fixtures/item-12345'

const query = (val: Record<string, string> = {}): any => ({ query: val })
const columns = (val: string) => query({ columns: val })

describe('test/service/data-item.test.ts', () => {
  const service = Container.get(DataItemService)

  it('should return item', async () => {
    await expect(service.handler('Item', '12345', query())).resolves.toMatchObject(item12345)
  })

  it('should handle string wildcard columns', async () => {
    await expect(service.handler('Item', '12345', columns('Name_*'))).resolves.toEqual({
      Name_chs: '兽王精准手镯',
      Name_de: 'Kampfvasallen-Armreif des Zielens',
      Name_en: 'Battleliege Bracelet of Aiming',
      Name_fr: 'Bracelet de pisteur de seigneur belliciste',
      Name_ja: 'ビーストリージュ・レンジャーブレスレット',
    })
  })
})
