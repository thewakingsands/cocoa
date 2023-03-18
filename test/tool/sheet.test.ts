import { getSheet } from '../../tools/lib/sheet/reader'

describe('test/tool/sheet.test.ts', () => {
  it('should read row with transient', async () => {
    const iter = (await getSheet('ContentFinderCondition')).iterator()

    // skip 0
    await iter.next()

    await expect(iter.next()).resolves.toMatchObject({
      done: false,
      value: {
        current: 1,
        row: {
          AcceptClassJobCategory: 108,
          AllianceRoulette: 0,
          AllowExplorerMode: 0,
          AllowReplacement: 1,
          AllowUndersized: 1,
          ClassJobLevelRequired: 24,
          ClassJobLevelSync: 27,
          Content: 1,
          ContentLinkType: 1,
          ContentMemberType: 2,
          ContentType: 2,
          DailyFrontlineChallenge: 0,
          Description:
            '过去曾经是关押偷猎者以及森林纵火魔等重犯的监狱。其看守的诨名“托托·拉克”取自传说中拥有一千张巨口的魔物，并且据说这名看守经常对囚犯施以残酷的拷问和严厉的惩罚。\n\n在30多年前，当时的幻术皇以“违反人道”的名义彻底封锁了这座令人生畏的监狱。然而，在失去了管理者之后，地下的牢狱如今已经变成了魔物筑巢群生的废墟……',
          Description_chs:
            '过去曾经是关押偷猎者以及森林纵火魔等重犯的监狱。其看守的诨名“托托·拉克”取自传说中拥有一千张巨口的魔物，并且据说这名看守经常对囚犯施以残酷的拷问和严厉的惩罚。\n\n在30多年前，当时的幻术皇以“违反人道”的名义彻底封锁了这座令人生畏的监狱。然而，在失去了管理者之后，地下的牢狱如今已经变成了魔物筑巢群生的废墟……',
          Description_de:
            'In Toto-Rak wurden ursprünglich Wilderer, Brandstifter und andere Schwerverbrecher inhaftiert. Der Name stammt von einem legendären Monster mit eintausend Mäulern, der von den Insassen auf diesen Kerker übertragen wurde. Er schien ihnen tausend Zellen zu haben, und die Grausamkeit eines sadistischen Wärters, der die Gefangenen auf bestialische Weise folterte, stand dem Schrecken des Sagenmonsters in keiner Weise nach. Nach 30 Jahren ließen die Druiden den Kerker angesichts der unwürdigen Zustände schließen. Allerdings nisteten sich schon bald nach dem Abzug der gridanischen Wachen Monster in den Höhlen und Gängen ein ...',
          Description_en:
            "Named after a man-eating creature from Padjali folklore, the Thousand Maws of Toto-Rak was built on the site of a natural cave system beneath Silent Arbor. Until recently, it held all of Gridania's foulest criminals, from arsonists to poachers, but the completion of a new gaol closer to the city heralded its abandonment.",
          Description_fr:
            "Tirant leur nom d'une créature mangeuse d'hommes issue de l'ancien folklore des Padjals, les Mille Gueules de Toto-Rak ont été bâties dans un réseau de grottes naturelles situé sous la Charmille silencieuse. Cet austère pénitencier abritait jusqu'à une époque récente les pires criminels de Gridania, des incendiaires aux braconniers. Le geôlier, surnommé Toto-Rak, était sinistrement connu pour faire subir à ses détenus d'atroces tortures et châtiments. L'Oracle de l'époque ayant déclaré l'endroit inhumain et contraire aux principes de l'harmonie gridanienne, la fermeture des Mille Gueules fut décidée il y a une trentaine d'années, permettant aux monstres d'envahir l'endroit.",
          Description_ja:
            'かつて密猟者や森林放火魔といった重犯罪人を収監するために利用されていた監獄。千の口を持つ伝説の魔物の名にちなみ、「トトラク」と渾名された看守が、囚人たちに厳しい拷問と制裁を加えていたと伝えられる。\n恐るべきこの監獄が閉鎖されたのは30数年前の事。当時の幻術皇により、「人の道に反する」として閉じられてからというもの、地下監獄は管理する者もなく、魔物たちが巣喰う廃墟と化していたのだが……。',
          DutyRecorderAllowed: 0,
          ExpertRoulette: 0,
          FeastTeamRoulette: 0,
          GuildHestRoulette: 0,
          HighEndDuty: 0,
          HighLevelRoulette: 0,
          ID: 1,
          Icon: '',
          IconHD: '',
          IconID: 0,
          Image: '/i/112000/112005.png',
          ImageID: 112005,
          ItemLevelRequired: 0,
          ItemLevelSync: 0,
          LevelCapRoulette: 0,
          LevelingRoulette: 1,
          MSQRoulette: 0,
          MentorRoulette: 1,
          Name: '监狱废墟托托·拉克千狱',
          NameShort: '',
          NameShort_chs: '',
          NameShort_de: '',
          NameShort_en: '',
          NameShort_fr: '',
          NameShort_ja: '',
          Name_chs: '监狱废墟托托·拉克千狱',
          Name_de: 'Tausend Löcher von Toto-Rak',
          Name_en: 'the Thousand Maws of Toto–Rak',
          Name_fr: 'les Mille Gueules de Toto-Rak',
          Name_ja: '監獄廃墟 トトラクの千獄',
          NormalRaidRoulette: 0,
          Patch: 23,
          PvP: 0,
          ShortCode: 'f1r1_re',
          ShortCode_chs: 'f1r1_re',
          ShortCode_de: 'f1r1_re',
          ShortCode_en: 'f1r1_re',
          ShortCode_fr: 'f1r1_re',
          ShortCode_ja: 'f1r1_re',
          SortKey: 5,
          TerritoryType: 1039,
          Transient: 1,
          TransientKey: 6,
          TrialRoulette: 0,
          UnlockQuest: 0,
          Url: '/ContentFinderCondition/1',
        },
        stringColumns: ['ShortCode', 'Name', 'NameShort'],
        total: undefined,
      },
    })
  })
  it('should read row with description', async () => {
    const node = {
      condition: {
        left: 'class_job_id',
        operator: '==',
        right: 8,
      },
      false: [100],
      true: [
        {
          condition: {
            left: 'class_job_level',
            operator: '>=',
            right: 31,
          },
          false: [100],
          true: [120],
        },
      ],
    }

    const iter = (await getSheet('CraftAction')).iterator()
    // skip 0
    await iter.next()

    await expect(iter.next()).resolves.toMatchObject({
      done: false,
      value: {
        current: 1,
        row: {
          ALC: 100090,
          ARM: 100030,
          AnimationEnd: 246,
          AnimationStart: 239,
          BSM: 100015,
          CRP: 100001,
          CUL: 100105,
          ClassJob: 8,
          ClassJobCategory: 9,
          ClassJobLevel: 1,
          Cost: 0,
          Description: '消耗耐久以推动作业进展\n效率：120\n成功率：100%',
          DescriptionJSON: ['消耗耐久以推动作业进展\n效率：', node, '\n成功率：100%'],
          DescriptionJSON_chs: ['消耗耐久以推动作业进展\n效率：', node, '\n成功率：100%'],
          DescriptionJSON_de: [
            'Die Arbeit schreitet fort, dafür sinkt die Belastbarkeit.\nEffizienz: ',
            node,
            '\nErfolgswahrscheinlichkeit: 100 %',
          ],
          DescriptionJSON_en: [
            'Increases <span style="color:#be6700;">progress</span>.\n<span style="color:#52a05f;">Efficiency:</span> ',
            node,
            '%\n<span style="color:#52a05f;">Success Rate:</span> 100%',
          ],
          DescriptionJSON_fr: [
            'Fait progresser la synthèse au détriment de la solidité.\nEfficacité: ',
            node,
            '\nTaux de réussite: 100%',
          ],
          DescriptionJSON_ja: ['耐久を消費して、作業を進める。\n効率：', node, '\n成功率：100％'],
          Description_chs: '消耗耐久以推动作业进展\n效率：120\n成功率：100%',
          Description_de:
            'Die Arbeit schreitet fort, dafür sinkt die Belastbarkeit.\nEffizienz: 120\nErfolgswahrscheinlichkeit: 100 %',
          Description_en:
            'Increases <span style="color:#be6700;">progress</span>.\n<span style="color:#52a05f;">Efficiency:</span> 120%\n<span style="color:#52a05f;">Success Rate:</span> 100%',
          Description_fr:
            'Fait progresser la synthèse au détriment de la solidité.\nEfficacité: 120\nTaux de réussite: 100%',
          Description_ja: '耐久を消費して、作業を進める。\n効率：120\n成功率：100％',
          GSM: 100075,
          GamePatchID: 2,
          GamePatch: { ID: 2 },
          ID: 100001,
          Icon: '/i/001000/001501.png',
          IconHD: '/i/001000/001501_hr1.png',
          IconID: 1501,
          LTW: 100045,
          Name: '制作',
          Name_chs: '制作',
          Name_de: 'Bearbeiten',
          Name_en: 'Basic Synthesis',
          Name_fr: 'Travail de base',
          Name_ja: '作業',
          Patch: 2,
          QuestRequirement: 0,
          Specialist: 0,
          Url: '/CraftAction/100001',
          WVR: 100060,
        },
        stringColumns: ['Name', 'Description'],
        total: undefined,
      },
    })
  })
})
