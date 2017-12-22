// service
import Hilo from 'hilojs';
import Asset from './Asset';
import ReadyScene from './ReadyScene';
import OverScene from './OverScene';
import Holdbacks from './Holdbacks';
import Bird from './Bird';

// images
import imgBg from '../../static/images/bg.png';

export default class {
  constructor() {
    // private
    this.width = 0;
    this.height = 0;
    this.asset = null;
    this.stage = null;
    this.ticker = null;
    this.state = null;
    this.score = 0;
    this.bg = null;
    this.ground = null;
    this.bird = null;
    this.holdbacks = null;
    this.gameReadyScene = null;
    this.gameOverScene = null;
  };

  init() {
    this.asset = new Asset();
    console.log(this.asset);
    this.asset.on('complete', (e) => {
      this.asset.off('complete');
      this.initStage();
    });
    this.asset.load();
  };

  initStage() {
    this.width = 720;
    this.height = 1280;
    this.scale = 0.5;

    // 舞台
    this.stage = new Hilo.Stage({
      renderType: 'canvas',
      width: this.width,
      height: this.height,
      scaleX: this.scale,
      scaleY: this.scale
    });
    document.body.appendChild(this.stage.canvas);

    // 启动计时器
    this.ticker = new Hilo.Ticker(60);
    this.ticker.addTick(Hilo.Tween);
    this.ticker.addTick(this.stage);
    this.ticker.start();

    // 绑定交互事件
    this.stage.enableDOMEvent(Hilo.event.POINTER_START, true);
    this.stage.on(Hilo.event.POINTER_START, this.onUserInput.bind(this));

    // Space键控制
    document.addEventListener('keydown', e => {
      if (e.keyCode === 32) this.onUserInput(e);
    });

    // 舞台更新
    this.stage.onUpdate = this.onUpdate.bind(this);

    // 初始化
    this.initBackground();
    this.initScenes();
    this.initHoldbacks();
    this.initBird();
    this.initCurrentScore();

    // 准备游戏
    this.gameReady();
  };

  initBackground() {
    // 背景
    let
      bgWidth = this.width * this.scale
      , bgHeight = this.height * this.scale
    ;

    document.body.insertBefore(Hilo.createElement('div', {
      id: 'bg',
      style: {
        background: 'url(' + imgBg + ') no-repeat',
        backgroundSize: bgWidth + 'px, ' + bgHeight + 'px',
        position: 'absolute',
        width: bgWidth + 'px',
        height: bgHeight + 'px'
      }
    }), this.stage.canvas);

    // 地面
    this.ground = new Hilo.Bitmap({
      id: 'ground',
      image: this.asset.ground
    }).addTo(this.stage);

    // 设置地面的y轴坐标
    this.ground.y = this.height - this.ground.height;

    // 移动地面
    Hilo.Tween.to(this.ground, {x: -60}, {duration: 300, loop: true});
  };

  initCurrentScore() {
    //当前分数
    this.currentScore = new Hilo.BitmapText({
      id: 'score',
      glyphs: this.asset.numberGlyphs,
      text: 0
    }).addTo(this.stage);

    //设置当前分数的位置
    this.currentScore.x = this.width - this.currentScore.width >> 1;
    this.currentScore.y = 180;
  };

  initBird() {
    this.bird = new Bird({
      id: 'bird',
      atlas: this.asset.birdAtlas,
      startX: 100,
      startY: this.height >> 1,
      groundY: this.ground.y - 12
    }).addTo(this.stage, this.ground.depth - 1);
  };

  initHoldbacks() {
    this.holdbacks = new Holdbacks({
      id: 'holdbacks',
      image: this.asset.holdback,
      height: this.height,
      startX: this.width * 2,
      groundY: this.ground.y
    }).addTo(this.stage, this.ground.depth - 1);
  };

  initScenes() {
    //准备场景
    this.gameReadyScene = new ReadyScene({
      width: this.width,
      height: this.height,
      image: this.asset.ready
    }).addTo(this.stage);

    //结束场景
    this.gameOverScene = new OverScene({
      width: this.width,
      height: this.height,
      image: this.asset.over,
      numberGlyphs: this.asset.numberGlyphs,
      visible: false
    }).addTo(this.stage);

    //绑定开始按钮事件
    this.gameOverScene.getChildById('start').on(Hilo.event.POINTER_START, (e) => {
      e._stopped = true;
      this.gameOverScene.visible = false;
      this.gameReady();
    });
  };

  onUserInput(e) {
    if (this.state !== 'over') {
      //启动游戏场景
      if (this.state !== 'playing') this.gameStart();
      //控制小鸟往上飞
      this.bird.startFly();
    }
  };

  onUpdate(delta) {
    if (this.state === 'ready') {
      return;
    }

    if (this.bird.isDead) {
      this.gameOver();
    } else {
      this.currentScore.setText(this.calcScore());
      //碰撞检测
      if (this.holdbacks.checkCollision(this.bird)) {
        this.gameOver();
      }
    }
  };

  gameReady() {
    this.state = 'ready';
    this.score = 0;
    this.currentScore.visible = true;
    this.currentScore.setText(this.score);
    this.gameReadyScene.visible = true;
    this.holdbacks.reset();
    this.bird.getReady();
  };

  gameStart() {
    this.state = 'playing';
    this.gameReadyScene.visible = false;
    this.holdbacks.startMove();
  };

  gameOver() {
    if (this.state !== 'over') {
      //设置当前状态为结束over
      this.state = 'over';
      //停止障碍的移动
      this.holdbacks.stopMove();
      //小鸟跳转到第一帧并暂停
      this.bird.goto(0, true);
      //隐藏屏幕中间显示的分数
      this.currentScore.visible = false;
      //显示结束场景
      this.gameOverScene.show(this.calcScore(), this.saveBestScore());
    }
  };

  calcScore() {
    let count = this.holdbacks.calcPassThrough(this.bird.x);
    return this.score = count;
  };

  saveBestScore() {
    let
      score = this.score
      , best = 0
    ;

    if (Hilo.browser.supportStorage) {
      best = parseInt(localStorage.getItem('hilo-flappy-best-score')) || 0;
    }
    if (score > best) {
      best = score;
      localStorage.setItem('hilo-flappy-best-score', score);
    }
    return best;
  };

};

