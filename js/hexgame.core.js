/**
 * hexgame.core.js
 */
(function(window, document, hex, tilde, undefined){

var
  
  // hex game
  hexgame = window.hexgame = hex.create(hex.evented),
  
  // hex grid for background effect
  inner = document.getElementById("hexinner"),
  outer = document.getElementById("hexouter"),
  score = document.getElementById("hexscore"),
  grid = hex.grid(outer),
  
  // cursor to indicate mouse location
  cursor = document.createElement("div"),
  
  // tiles placed and state
  tiles = {},
  state = {},
  
  // tiles fading
  fade = {},
  fadecount = 0,
  fadetimer,
  attemptFade = true,
  
  // score timer
  scoretimer,
  scoredelay = 250,
  
  // unique id
  uid = Math.random();

// cancel hexlib processing of certain events if not targeting inner/outer wrapper
function cancelInner(e) {
  var target = e.getTarget();
  if (target !== inner) {
    e.stopPropagation();
  }
}
hex.addEvent(inner, "mousedown", cancelInner);
hex.addEvent(inner, "touchstart", cancelInner);
hex.addEvent(inner, "MozTouchDown", cancelInner);
hex.addEvent(inner, "mousewheel", cancelInner);
hex.addEvent(inner, "DOMMouseScroll", cancelInner);

// arrow key presses should pan
function keynav(event) {
  
  var g = grid;
  
  switch (event.keyCode) {
    case 37:
      g.reorient(g.origin.x + g.tileWidth, g.origin.y);
      break;    
    case 38:
      g.reorient(g.origin.x, g.origin.y + g.tileHeight);
      break;    
    case 39:
      g.reorient(g.origin.x - g.tileWidth, g.origin.y);
      break;    
    case 40:
      g.reorient(g.origin.x, g.origin.y - g.tileHeight);
      break;    
   }
   
}
hex.addEvent(window, "keypress", keynav);

// should this browser attempt to fade tiles?
// TODO: Instead of deciding beforehand, use performance monitoring to decide later
attemptFade = !(
  
  // not IE - fading looks horrible
  window.ActiveXObject ||
  
  // small screen devices shouldn't waste the processing power
  window.screen.availWidth < 600
  
);

/**
 * Toggle a tile and schedule for fading.
 * @param {int} x X hex grid coordinate.
 * @param {int} y Y hex grid coordinate.
 * @param {number} opacity Target opacity (optional).
 */
function toggle( x, y, opacity ) {
  var
    k = hex.key(x, y),
    on = !state[k],
    tile = tiles[k],
    inv,
    style,
    target;
  if (opacity === undefined) {
    opacity = 1;
  }
  state[k] = on;
  if (!tile) {
    inv = grid.screenpos(x, y);
    tile = tiles[k] = document.createElement("div");
    tile.style.display = "none";
    tile.className = "tile";
    tile.style.left = inv.x + "px";
    tile.style.top = inv.y + "px";
    grid.root.appendChild(tile);
  }
  if (!attemptFade) {
    tiles[k].style.display = on ? "" : "none";
    return;
  }
  target = fade[k];
  if (target !== undefined) {
    fade[k] = target ? 0 : 1;
  } else {
    style = tiles[k].style;
    if (on) {
      style.opacity = 0;
      style.display = "";
      fade[k] = opacity;
    } else {
      style.opacity = opacity;
      fade[k] = 0;
    }
    fadecount++;
  }
  if (!fadetimer) {
    fadetimer = window.setInterval(fader, 50);
  }
}

/**
 * Visit the tile and all immediate neighbors and toggle visibility.
 * @param {int} x Hex X coordinate.
 * @param {int} y Hex Y coordinate.
 * @param {number} opacity Target opacity (optional).
 */
function touch( x, y, opacity ) {
  
  if (opacity === undefined) {
    opacity = 1;
  }
  
  // visit the tile and all immediate neighbors and toggle visibility
  for (var i=-1; i<2; i++) {
    for (var j=-1; j<2; j++) {
      if (i!==j || i===0) {
        toggle(x + i, y + j, opacity);
      }
    }
  }
  
  grid.root.removeChild(cursor);
  grid.root.appendChild(cursor);
  
  // broadcast toggle message
  tilde.send('jsdev-hexgame-touch', {
    uid: uid,
    x: x,
    y: y,
    opacity: opacity
  });
  
  if (scoretimer) {
    clearTimeout(scoretimer);
    scoretimer = null;
  }
  scoretimer = setTimeout(rescore, scoredelay);

}

/**
 * Calculate and set the score.
 */
function rescore() {
  var
    s = 0,
    state = hexgame.state,
    tiles = hexgame.tiles,
    k;
  for (k in state) {
    if (state[k]) {
      if ((/g128/).test(tiles[k].className)) {
        s++;
      } else if ((/n18/).test(tiles[k].className)) {
        s--;
      }
    }
  }
  score.innerHTML = s;
}

/**
 * Listen for other players' touches and take action.
 */
tilde.listen('jsdev-hexgame-touch', function(msg) {
  var
    data = msg.data,
    key = hex.key;
  if (data.uid !== uid) {
    toggle(data.x, data.y);
    tiles[key(data.x, data.y)].className = "tile n18";
  }
  if (scoretimer) {
    clearTimeout(scoretimer);
    scoretimer = null;
  }
  scoretimer = setTimeout(rescore, scoredelay);
});

/**
 * Handle incremental fading.
 */
function fader() {
  var
    toremove = [],
    pos = 0,
    increment = 0.2;
  for (var k in fade) {
    var
      target = fade[k],
      tile = tiles[k],
      style = tile.style,
      opacity = +style.opacity;
    if (target > opacity) {
      if (target > opacity + increment) {
        style.opacity = opacity + increment;
      } else {
        style.opacity = target;
        toremove[pos++] = k;
        fadecount--;
      }
    } else {
      if (target <= opacity - increment) {
       style.opacity = 0.1 * (((opacity - increment) * 10) << 0);
      } else {
        style.opacity = target;
        toremove[pos++] = k;
        fadecount--;
      }
    }
  }
  for (var i=0; i<pos; i++) {
    delete fade[toremove[i]];
  }
  if (fadecount <= 0) {
    window.clearTimeout(fadetimer);
    fadetimer = null;
  }
}

// setup cursor
cursor.className = "tile cursor";
cursor.style.display = "none";
grid.root.appendChild(cursor);

// move the cursor
grid.addEvent("tileover", function(e, x, y) {
  hex.log([x, y], e.type);
  var inv = grid.screenpos(x, y);
  cursor.style.left = inv.x + "px";
  cursor.style.top = inv.y + "px";
});

// trigger on click
grid.addEvent("tiletap", function(e, x, y) {
  hex.log([x, y], e.type);
  touch(x, y, 1);
});

// show cursor only when mouse is over the grid
grid.addEvent("gridover", function(e, x, y) {
  hex.log([x, y], e.type);
  cursor.style.display = "";
});
grid.addEvent("gridout", function(e, x, y) {
  hex.log([x, y], e.type);
  cursor.style.display = "none";
});

// expose game elements
hex.extend(hexgame, {
  inner: inner,
  outer: outer,
  grid: grid,
  cursor: cursor,
  toggle: toggle,
  touch: touch,
  tiles: tiles,
  state: state
});

})(window, window.document, window.hex, window['~']);
