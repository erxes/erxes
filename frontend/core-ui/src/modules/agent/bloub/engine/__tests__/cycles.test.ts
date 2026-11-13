// Vendored from github.com/jeremy-prt/bloub (MIT, see ../LICENSE).
import {
  MAX_BLOCK,
  MAX_BLOCS,
  MAX_CYCLES,
  MIN_BLOCK,
  blockAt,
  blocksWith,
  clampDuration,
  defaultCycle,
  makeBlock,
  minDurationOf,
  moveBlock,
  nextCycleId,
  parseCycles,
  totalDuration,
  type Cycle,
  uniqueName
} from '../cycles'
import { SEQUENCE, STATES, STATE_BY_ID } from '../states'

describe('cycle par defaut', () => {
  it('reprend la sequence relevee sur la video, dans l ordre', () => {
    expect(defaultCycle().blocks.map((b) => b.state)).toEqual(SEQUENCE)
  })

  it('tient chaque etat sa duree mesuree', () => {
    for (const block of defaultCycle().blocks) {
      expect(block.duration).toBe(STATE_BY_ID.get(block.state)!.duration)
    }
  })

  it('est reconstruit a l identique a chaque appel', () => {
    expect(defaultCycle()).toEqual(defaultCycle())
    // ...sans partager d'objet, sinon editer un montage toucherait l amorce
    expect(defaultCycle().blocks[0]).not.toBe(defaultCycle().blocks[0])
  })

  it('laisse toujours de la place pour un nouveau cycle, sans collision', () => {
    const reference = defaultCycle()
    const un: Cycle = {
      id: nextCycleId([reference]),
      name: uniqueName('Mon cycle', [reference]),
      blocks: []
    }
    const deux: Cycle = {
      id: nextCycleId([reference, un]),
      name: uniqueName('Mon cycle', [reference, un]),
      blocks: []
    }
    expect(un.id).not.toBe(reference.id)
    expect(deux.id).not.toBe(un.id)
    expect(deux.name).not.toBe(un.name)
  })
})

describe('durees', () => {
  it('ne descend pas sous le plancher du moteur', () => {
    // en dessous, le bloc est plus court que le fondu d entree du suivant
    expect(clampDuration('idle', 0.1)).toBe(MIN_BLOCK)
    expect(clampDuration('idle', -5)).toBe(MIN_BLOCK)
  })

  it('respecte la mesure des etats qui ont besoin d aboutir', () => {
    // le "!" revient a 2.0, le corps se recompose a 2.4
    expect(minDurationOf('alert')).toBe(2)
    expect(minDurationOf('burst')).toBe(2.4)
    expect(clampDuration('orbit', 1)).toBe(2.5)
    // un etat qui ignore le temps n a que le plancher
    expect(minDurationOf('idle')).toBe(MIN_BLOCK)
  })

  it('n autorise aucun etat a descendre sous sa mesure', () => {
    for (const state of SEQUENCE) {
      expect(clampDuration(state, 0)).toBeGreaterThanOrEqual(minDurationOf(state))
    }
  })

  it('plafonne et tombe sur le pas, sans trainee de flottants', () => {
    expect(clampDuration('idle', 999)).toBe(MAX_BLOCK)
    expect(clampDuration('idle', 2.44)).toBe(2.4)
    expect(clampDuration('idle', 2.46)).toBe(2.5)
  })
})

describe('lecture', () => {
  const cycle: Cycle = {
    id: 'c1',
    name: 'Test',
    blocks: [
      { state: 'idle', duration: 2 },
      { state: 'wink', duration: 1 },
      { state: 'egg', duration: 3 }
    ]
  }

  it('additionne les blocs', () => {
    expect(totalDuration(cycle.blocks)).toBe(6)
  })

  it('trouve le bloc joue et le temps ecoule dedans', () => {
    expect(blockAt(cycle.blocks, 0)).toEqual({ index: 0, elapsed: 0 })
    expect(blockAt(cycle.blocks, 1.9)).toEqual({ index: 0, elapsed: 1.9 })
    // la borne appartient au bloc suivant
    expect(blockAt(cycle.blocks, 2)).toEqual({ index: 1, elapsed: 0 })
    expect(blockAt(cycle.blocks, 3.5)).toEqual({ index: 2, elapsed: 0.5 })
  })

  it('boucle au-dela du dernier bloc', () => {
    expect(blockAt(cycle.blocks, 6)).toEqual({ index: 0, elapsed: 0 })
    expect(blockAt(cycle.blocks, 8)).toEqual({ index: 1, elapsed: 0 })
  })

  it('ne casse pas sur un cycle vide', () => {
    expect(blockAt([], 3)).toEqual({ index: 0, elapsed: 0 })
    expect(totalDuration([])).toBe(0)
  })

  it('deplace un bloc sans toucher la liste d origine', () => {
    const blocks = cycle.blocks
    expect(moveBlock(blocks, 0, 2).map((b) => b.state)).toEqual(['wink', 'egg', 'idle'])
    expect(moveBlock(blocks, 2, 0).map((b) => b.state)).toEqual(['egg', 'idle', 'wink'])
    expect(blocks.map((b) => b.state)).toEqual(['idle', 'wink', 'egg'])
  })
})

describe('relecture du stockage', () => {
  it('ne casse pas sur du vide ou du JSON invalide', () => {
    expect(parseCycles(null)).toEqual([])
    expect(parseCycles('')).toEqual([])
    expect(parseCycles('{pas du json')).toEqual([])
    expect(parseCycles('{"id":"c1"}')).toEqual([])
  })

  it('jette les blocs dont l etat n existe plus', () => {
    const raw = '[{"id":"c1","name":"A","blocks":[{"state":"idle","duration":2},' +
      '{"state":"disparu","duration":2}]}]'
    expect(parseCycles(raw)[0]!.blocks.map((b) => b.state)).toEqual(['idle'])
  })

  it('ramene les durees aberrantes dans leurs bornes', () => {
    const raw = '[{"id":"c1","name":"A","blocks":[{"state":"idle","duration":-4},' +
      '{"state":"egg","duration":9999}]}]'
    expect(parseCycles(raw)[0]!.blocks.map((b) => b.duration)).toEqual([MIN_BLOCK, MAX_BLOCK])
  })

  it('jette un cycle vide, sans nom, ou en double', () => {
    expect(parseCycles('[{"id":"c1","name":"A","blocks":[]}]')).toEqual([])
    expect(parseCycles('[{"id":"c1","blocks":[{"state":"idle","duration":2}]}]')).toEqual([])
    const doublon = '[{"id":"c1","name":"A","blocks":[{"state":"idle","duration":2}]},' +
      '{"id":"c1","name":"B","blocks":[{"state":"egg","duration":2}]}]'
    expect(parseCycles(doublon).map((c) => c.name)).toEqual(['A'])
  })

  it('ne garde que les champs du modele, pas ce qu on lui glisse en plus', () => {
    const raw = '[{"id":"defaut","name":"Mon montage","locked":true,"secret":1,' +
      '"blocks":[{"state":"idle","duration":2,"vitesse":3}]}]'
    const cycle = parseCycles(raw)[0]!
    expect(Object.keys(cycle).sort()).toEqual(['blocks', 'id', 'name'])
    expect(Object.keys(cycle.blocks[0]!).sort()).toEqual(['duration', 'state'])
  })

  /*
   * Le stockage est modifiable et tient quelques megaoctets, alors que rien en aval n'est
   * dimensionne pour ca. Un seul cycle de 150 000 blocs — environ 4 Mo de JSON, donc dans
   * le budget — donnait 1 500 000 s de duree, autant de graduations a allouer et une piste
   * de 29 700 000 px : l'onglet figeait en entrant dans la vue Animations.
   */
  it('borne la taille d un montage relu', () => {
    const blocs = Array.from({ length: 200_000 }, () => ({ state: 'idle', duration: 10 }))
    const raw = JSON.stringify([{ id: 'c1', name: 'A', blocks: blocs }])
    expect(parseCycles(raw)[0]!.blocks).toHaveLength(MAX_BLOCS)
  })

  /*
   * Le plancher est DERIVE du plus long `morph`, il n'est plus ecrit a la main. Ce test
   * garde le lien visible : il valait 0,6 en dur, ce qui ne marchait que parce que 0,6
   * etait justement le morph d'`orbit`. Un etat qui morphe plus lentement le suit.
   */
  it('le plancher de bloc couvre le plus long fondu du catalogue', () => {
    const plusLong = Math.max(...STATES.map((s) => s.morph))
    expect(MIN_BLOCK).toBeGreaterThanOrEqual(plusLong)
    // et il n'est pas gratuitement plus grand : c'est exactement ce fondu
    expect(MIN_BLOCK).toBe(plusLong)
  })

  it('borne aussi l ajout depuis l editeur, pas seulement la relecture', () => {
    let blocs = Array.from({ length: MAX_BLOCS }, () => makeBlock('idle'))
    expect(blocksWith(blocs, 'egg')).toHaveLength(MAX_BLOCS)
    // et il reste possible d'ajouter juste en dessous de la borne
    blocs = blocs.slice(0, MAX_BLOCS - 1)
    expect(blocksWith(blocs, 'egg')).toHaveLength(MAX_BLOCS)
  })

  it('borne le nombre de montages relus', () => {
    const raw = JSON.stringify(
      Array.from({ length: 5000 }, (_, i) => ({
        id: `c${i}`,
        name: `A${i}`,
        blocks: [{ state: 'idle', duration: 2 }]
      }))
    )
    expect(parseCycles(raw)).toHaveLength(MAX_CYCLES)
  })

  /*
   * `swirl` est la transition d'entree des reglages, deliberement hors de `SEQUENCE` : un
   * test la garde hors de la palette et de la planche. Un montage utilisateur ne se
   * construit qu'a partir de la palette, donc elle ne peut arriver ici que par un stockage
   * bricole a la main — et on l'y refuse comme partout ailleurs.
   */
  it('refuse un etat hors catalogue, `swirl` compris', () => {
    const raw = '[{"id":"c1","name":"A","blocks":[{"state":"swirl","duration":2},' +
      '{"state":"idle","duration":2}]}]'
    expect(parseCycles(raw)[0]!.blocks.map((b) => b.state)).toEqual(['idle'])
    // un montage qui n'en contiendrait QUE devient vide, donc tombe
    expect(parseCycles('[{"id":"c1","name":"A","blocks":[{"state":"swirl","duration":2}]}]')).toEqual(
      []
    )
  })
})
