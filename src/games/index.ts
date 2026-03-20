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
import { metadata as goldMiner } from './gold-miner/metadata';
import GoldMinerThumbnail from './gold-miner/thumbnail';
import { metadata as cityBrawler } from './city-brawler/metadata';
import CityBrawlerThumbnail from './city-brawler/thumbnail';
import { metadata as commandoStrike } from './commando-strike/metadata';
import CommandoStrikeThumbnail from './commando-strike/thumbnail';
import { metadata as superJumper } from './super-jumper/metadata';
import SuperJumperThumbnail from './super-jumper/thumbnail';
import { zombiePlantMetadata as zombiePlant } from './zombie-plant/metadata';
import ZombiePlantThumbnail from './zombie-plant/thumbnail';

export const games = [
  { ...cyberStrike, Thumbnail: CyberStrikeThumbnail },
  { ...voidExplorer, Thumbnail: VoidExplorerThumbnail },
  { ...pixelQuest, Thumbnail: PixelQuestThumbnail },
  { ...synthRacer, Thumbnail: SynthRacerThumbnail },
  { ...dataMiner, Thumbnail: DataMinerThumbnail },
  { ...goldMiner, Thumbnail: GoldMinerThumbnail },
  { ...cityBrawler, Thumbnail: CityBrawlerThumbnail },
  { ...commandoStrike, Thumbnail: CommandoStrikeThumbnail },
  { ...superJumper, Thumbnail: SuperJumperThumbnail },
  { ...zombiePlant, Thumbnail: ZombiePlantThumbnail },
];
