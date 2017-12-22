import './theme/main.scss';

import preventDefault from 'awesome-js-funcs/event/preventDefault';

// service
import Game from './game/Game';

if (DEVELOPMENT) {
  console.log('Development Mode');
  console.log(require('awesome-js-funcs/handheld').getBrowserInfo());
}

if (PRODUCTION) {
  console.log('Production Mode');
}

// contextMenu preventDefault
document.addEventListener('contextmenu', preventDefault);
document.addEventListener('touchmove', preventDefault, false);

// web page init
document.addEventListener('DOMContentLoaded', () => {
  new Game().init();
}, false);
