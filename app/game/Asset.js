// service
import Hilo from 'hilojs';

// images
import imgBg from '../../static/images/bg.png';
import imgGround from '../../static/images/ground.png';
import imgReady from '../../static/images/ready.png';
import imgOver from '../../static/images/over.png';
import imgNumber from '../../static/images/number.png';
import imgBird from '../../static/images/bird.png';
import imgHoldback from '../../static/images/holdback.png';


export default class extends Hilo.Class.create({
  Mixes: Hilo.EventMixin,
}) {
  constructor() {
    super();
    // private
    this.queue = null;
    this.bg = null;
    this.ground = null;
    this.ready = null;
    this.over = null;
    this.numberGlyphs = null;
    this.birdAtlas = null;
    this.holdback = null;
  };

  load() {
    let resources = [
      {id: 'bg', src: imgBg},
      {id: 'ground', src: imgGround},
      {id: 'ready', src: imgReady},
      {id: 'over', src: imgOver},
      {id: 'number', src: imgNumber},
      {id: 'bird', src: imgBird},
      {id: 'holdback', src: imgHoldback}
    ];

    this.queue = new Hilo.LoadQueue();
    this.queue.add(resources);
    this.queue.on('complete', this.onComplete.bind(this));
    this.queue.start();
  };

  onComplete(e) {
    this.bg = this.queue.get('bg').content;
    this.ground = this.queue.get('ground').content;
    this.ready = this.queue.get('ready').content;
    this.over = this.queue.get('over').content;
    this.holdback = this.queue.get('holdback').content;

    this.birdAtlas = new Hilo.TextureAtlas({
      image: this.queue.get('bird').content,
      frames: [
        [0, 120, 86, 60],
        [0, 60, 86, 60],
        [0, 0, 86, 60]
      ],
      sprites: {
        bird: [0, 1, 2]
      }
    });

    let number = this.queue.get('number').content;
    this.numberGlyphs = {
      0: {image: number, rect: [0, 0, 60, 91]},
      1: {image: number, rect: [61, 0, 60, 91]},
      2: {image: number, rect: [121, 0, 60, 91]},
      3: {image: number, rect: [191, 0, 60, 91]},
      4: {image: number, rect: [261, 0, 60, 91]},
      5: {image: number, rect: [331, 0, 60, 91]},
      6: {image: number, rect: [401, 0, 60, 91]},
      7: {image: number, rect: [471, 0, 60, 91]},
      8: {image: number, rect: [541, 0, 60, 91]},
      9: {image: number, rect: [611, 0, 60, 91]}
    };

    this.queue.off('complete');
    this.fire('complete');
  };
};
