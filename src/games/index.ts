import { metadata as cyberStrike } from './cyber-strike/metadata';
import CyberStrikeThumbnail from './cyber-strike/thumbnail';
import { metadata as voidExplorer } from './void-explorer/metadata';
import VoidExplorerThumbnail from './void-explorer/thumbnail';
import { metadata as pixelQuest } from './pixel-quest/metadata';
import PixelQuestThumbnail from './pixel-quest/thumbnail';
import { metadata as synthRacer } from './synth-racer/metadata';
import SynthRacerThumbnail from './synth-racer/thumbnail';
import { metadata as dataMiner } from './data-miner/metadata';
import DataMinerThumbnail from './data-miner/thumbnail';
import { metadata as superJumper } from './super-jumper/metadata';
import SuperJumperThumbnail from './super-jumper/thumbnail';
import { metadata as goldMiner } from './gold-miner/metadata';
import GoldMinerThumbnail from './gold-miner/thumbnail';
import { metadata as streetsOfRage } from './streets-of-rage/metadata';
import StreetsOfRageThumbnail from './streets-of-rage/thumbnail';
import { metadata as contra } from './contra/metadata';
import ContraThumbnail from './contra/thumbnail';
import { metadata as superMario } from './super-mario/metadata';
import SuperMarioThumbnail from './super-mario/thumbnail';
import { zombiePlantMetadata as zombiePlant } from './zombie-plant/metadata';
import ZombiePlantThumbnail from './zombie-plant/thumbnail';

export const games = [
  { ...cyberStrike, Thumbnail: CyberStrikeThumbnail },
  { ...voidExplorer, Thumbnail: VoidExplorerThumbnail },
  { ...pixelQuest, Thumbnail: PixelQuestThumbnail },
  { ...synthRacer, Thumbnail: SynthRacerThumbnail },
  { ...dataMiner, Thumbnail: DataMinerThumbnail },
  { ...superJumper, Thumbnail: SuperJumperThumbnail },
  { ...goldMiner, Thumbnail: GoldMinerThumbnail },
  { ...streetsOfRage, Thumbnail: StreetsOfRageThumbnail },
  { ...contra, Thumbnail: ContraThumbnail },
  { ...superMario, Thumbnail: SuperMarioThumbnail },
  { ...zombiePlant, Thumbnail: ZombiePlantThumbnail },
];
