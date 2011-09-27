/**
 * chat.js - implement simple chat.
 */
(function(window, $, tilde) {
  
  var
    $chatlog = $('#chatlog'),
    $chatuser = $('#chatuser'),
    $chatstuff = $('#chatstuff'),
    $messagebox = $('#messagebox'),
    $messagesubmit = $('#messagesubmit'),
    
    storage = window.localStorage,
    
    illegal = /[^\w- ']/g;
  
  // convenience methods for working with localStorage
  function get(key) {
    var value = storage.getItem('chat-' + key);
    return value ? JSON.parse(value) : value;
  }
  function set(key, value) {
    return storage.setItem('chat-' + key, JSON.stringify(value));
  }
  
  $chatuser.val(get('username'));
  
  // only show the good stuff if the user has specified a valid name
  function toggle() {
    var
      user = $chatuser.val().replace(illegal,'');
    if (user) {
      $chatstuff.show();
      set('username', user);
    } else {
      $chatstuff.hide();
    }
  }  
  $chatuser.bind('focus blur change', toggle);
  toggle();
  
  // listen for incoming chat messages
  tilde.listen('chat-stream', function(msg) {
    var
      user = (msg.data.user + '')
        .replace(illegal, '')
        .substr(0, 26),
      text = (msg.data.text + '')
        .substr(0, 140),
      time = (new Date())
        .toLocaleTimeString();
    $chatlog.val(
      user + ' (' +  time + "): " + text + "\n" + $chatlog.val()
    )
  });
  
  // post a message ...
  function post(e) {
    var
      user = $chatuser.val().replace(/[^\w]/g,''),
      text = $messagebox.val();
    if (text) {
      if (user) {
        tilde.send('chat-stream', {
          user: $chatuser.val().substr(0, 26),
          text: text.substr(0, 140)
        });
        $messagebox.val('');
      } else {
        
      }
    }
  }
  
  // ... on ENTER key or submit button click
  $messagebox.keyup(function(e){
    if (e.which === 13) {
      post();
    }
  });
  $messagesubmit.click(post);
    
})(window, jQuery, window['~']);
