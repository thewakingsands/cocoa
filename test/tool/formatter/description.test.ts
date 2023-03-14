/* eslint-disable no-irregular-whitespace */
import { formatDescription, formatDescriptionLogic } from '../../../tools/lib/formatter/description'

const case9 = `对目标发动物理攻击　<UIForeground>F201F8</UIForeground><UIGlow>F201F9</UIGlow>威力：<UIGlow>01</UIGlow><UIForeground>01</UIForeground><If(Equal(PlayerParameter(68),19))><If(GreaterThanOrEqualTo(PlayerParameter(72),84))>200<Else/>150</If><Else/>150</If>`
const case291 = `感知自己附近能够进行采集的最高级矿脉及石场，导向地图上也会显示出来
<UIForeground>F201F8</UIForeground><UIGlow>F201F9</UIGlow>发动条件：<UIGlow>01</UIGlow><UIForeground>01</UIForeground><UIForeground>F201F4</UIForeground><UIGlow>F201F5</UIGlow>矿脉勘探<UIGlow>01</UIGlow><UIForeground>01</UIForeground>效果中
<UIForeground>F201F8</UIForeground><UIGlow>F201F9</UIGlow>持续时间：<UIGlow>01</UIGlow><UIForeground>01</UIForeground>15秒`
const case292 = `令风之碎晶<If(GreaterThanOrEqualTo(PlayerParameter(68),16))><If(GreaterThanOrEqualTo(PlayerParameter(69),50))>、风之水晶、风之晶簇<Else/><If(GreaterThanOrEqualTo(PlayerParameter(69),41))>、风之水晶<Else/></If></If><Else/></If>的获得数增加2个`

describe('test/tool/description.test.ts', () => {
  it('should format to text', () => {
    expect(formatDescription(case9, true)).toEqual('对目标发动物理攻击　<span style="color:#52a05f;">威力：</span>200')
    expect(formatDescription(case291, true)).toEqual(
      '感知自己附近能够进行采集的最高级矿脉及石场，导向地图上也会显示出来\n<span style="color:#52a05f;">发动条件：</span><span style="color:#cc5600;">矿脉勘探</span>效果中\n<span style="color:#52a05f;">持续时间：</span>15秒',
    )
    expect(formatDescription(case292, true)).toEqual('令风之碎晶、风之水晶、风之晶簇的获得数增加2个')
  })
  it('should format to json', () => {
    expect(formatDescriptionLogic(case9)).toEqual([
      '对目标发动物理攻击　<span style="color:#52a05f;">威力：</span>',
      {
        condition: {
          left: 'class_job_id',
          operator: '==',
          right: 19,
        },
        false: [150],
        true: [
          {
            condition: {
              left: 'class_job_level',
              operator: '>=',
              right: 84,
            },
            false: [150],
            true: [200],
          },
        ],
      },
    ])

    expect(formatDescriptionLogic(case291)).toEqual([
      '感知自己附近能够进行采集的最高级矿脉及石场，导向地图上也会显示出来\n<span style="color:#52a05f;">发动条件：</span><span style="color:#cc5600;">矿脉勘探</span>效果中\n<span style="color:#52a05f;">持续时间：</span>15秒',
    ])

    expect(formatDescriptionLogic(case292)).toEqual([
      '令风之碎晶',
      {
        condition: {
          left: 'class_job_id',
          operator: '>=',
          right: 16,
        },
        false: '',
        true: [
          {
            condition: {
              left: 'class_job_level',
              operator: '>=',
              right: 50,
            },
            false: [
              {
                condition: {
                  left: 'class_job_level',
                  operator: '>=',
                  right: 41,
                },
                false: '',
                true: ['、风之水晶'],
              },
            ],
            true: ['、风之水晶、风之晶簇'],
          },
        ],
      },
      '的获得数增加2个',
    ])
  })
})
