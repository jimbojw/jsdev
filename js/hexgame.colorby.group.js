/**
 * hexgame.colorby.group.js
 */
(function(hex, hexgame, undefined) {

var
  
  // tile and state info
  state = hexgame.state,
  tiles = hexgame.tiles;

hexgame.addEvent("colorby", function(e, colorby) {
  
  var
    
    key = hex.key,
    
    visited,
    k,
    pos,
    x,
    y,
    group,
    n,
    m,
    elem,
    coords,
    i,
    j,
    kk;
  
  if (colorby === "group" && hexgame.colorby !== "group") {
    
    // color by group size
    visited = {};
    for (k in state) {
      if (state[k] && !visited[k]) {
        visited[k] = true;
        pos = k.indexOf(',');
        x = +k.substr(0, pos);
        y = +k.substr(pos + 1);
        group = [{
          tile: tiles[k],
          coords: [x, y]
        }];
        n = 1;
        for (m=0; m<n; m++) {
          elem = group[m];
          coords = elem.coords;
          x = coords[0];
          y = coords[1];
          for (i=-1; i<2; i++) {
            for (j=-1; j<2; j++) {
              if (i!==j) {
                kk = key(x + i, y + j);
                if (!visited[kk] && state[kk]) {
                  visited[kk] = true;
                  group[n++] = {
                    tile: tiles[kk],
                    coords: [x + i, y + j]
                  };
                }
              }
            }
          }
        }
        var s = "g" + n;
        if (n > 128) {
          s = "g128";
        } else if (n > 64) {
          s = "g64";
        } else if (n > 32) {
          s = "g32";
        }
        for (m=0; m<n; m++) {
          group[m].tile.className = "tile " + s;
        }
      }
    }
    
    // set colorby and trigger
    hexgame.colorby = "group";
    
  }
  
});

hexgame.grid.addEvent("tiletap", function(e, x, y) {
  
  // short-circuit if this is the wrong colorby type
  if (hexgame.colorby && hexgame.colorby !== "group") {
    return;
  }
  
  var
    
    // key generator
    key = hex.key,
    
    potentials = {},
    
    i,
    j,
    k,
    tile,
    z;
  
  // gather list of tiles that may belong to groups whose colors may have changed
  for (i=-2; i<3; i++) {
    for (j=-2; j<3; j++) {
      z = j + i;
      if (z > -3 && z < 3) {
        var
          xi = x + i,
          yj = y + j;
        k = key(xi, yj);
        if (state[k]) {
          potentials[k] = [xi, yj];
        }
      }
    }
  }
  
  // visit all tiles that may belong to changed groups and recolor according to group size
  var
    visited = {},
    m;
  for (k in potentials) {
    tile = tiles[k];
    if (!visited[k] && state[k]) {
      visited[k] = true;
      var
        group = [{
          tile: tile,
          coords: potentials[k]
        }],
        n = 1;
      for (m=0; m<n; m++) {
        var
          elem = group[m],
          member = elem.tile,
          coords = elem.coords,
          memberx = coords[0],
          membery = coords[1];
        for (i=-1; i<2; i++) {
          for (j=-1; j<2; j++) {
            if (i!==j) {
              var
                otherk = key(memberx + i, membery + j),
                other = tiles[otherk];
              if (!visited[otherk] && state[otherk]) {
                visited[otherk] = true;
                group[n++] = {
                  tile: other,
                  coords: [memberx + i, membery + j]
                };
              }
            }
          }
        }
      }
      var s = "g" + n;
      if (n > 128) {
        s = "g128";
      } else if (n > 64) {
        s = "g64";
      } else if (n > 32) {
        s = "g32";
      }
      for (m=0; m<n; m++) {
        group[m].tile.className = "tile " + s;
      }
      
    }
  }
  
});

})(window.hex, window.hexgame);

