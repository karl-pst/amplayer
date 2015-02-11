var app = angular.module('starter.services', []);

/**
 * A simple example service that returns some data.
 */
app.factory('Playlist', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var playlist = [
    { id: 0, name: 'Stack of Rock at IO' },
    { id: 1, name: 'OPM' },
    { id: 2, name: 'Power Pop' },
    { id: 3, name: 'I\'m not okay' }
  ];

  return {
    all: function() {
      return playlist;
    },
    get: function(playlistId) {
      // Simple index lookup
      return playlist[playlistId];
    }
  };
});


/**
 * dataSource
 * @param  {[type]} $http     [description]
 * @param  {[type]} $location [description]
 * @return {[type]}           [description]
 */
app.factory('dataSource', ['$http', '$location',function($http, $location){
  var time = Math.floor(new Date().getTime() / 1000);

  var key = function(password){
      return sha256(password);
      };

  var passphrase = function(password){
      return sha256(time + key(password));
      };

  var server_url = 'http://122.52.117.41/server/xml.server.php';

  return {
      getAuth: function(username, password){
          var config = {
              method: 'get',
              url: server_url,
              params: {
                  action: 'handshake',
                  auth: passphrase(password),
                  timestamp: time,
                  version: '370001',
                  user: username
              },
              transformResponse : function(data) {
                  // console.log(data);
                  var x2js = new X2JS();
                  var json = x2js.xml_str2json( data );
                  return json;
              }
          };

          var promise = $http(config);

          return promise;
      },

      getPlaylists: function(auth, filter, exact){
          var config = {
              method: 'get',
              url: server_url,
              params: {
                  action: 'playlists',
                  auth: auth,
                  filter: filter,
                  exact: exact
              },
              transformResponse : function(data) {
                  var x2js = new X2JS();
                  var json = x2js.xml_str2json( data );
                  return json;
              }
          };

          var promise = $http(config);

          return promise;
      },

      getSongs: function(auth, callback){
          var config = {
              method: 'get',
              url: server_url,
              params: {
                  action: 'songs',
                  auth: auth,
                  offset: 1,
                  limit: 10
              },
              transformResponse : function(data) {
                  // convert the data to JSON and provide
                  // it to the success function below      
                  //console.log(data);
                  var x2js = new X2JS();
                  var json = x2js.xml_str2json( data );
                  return json;
              }
          };

          var promise = $http(config).success(function(data, success){
              // send the converted data back
              // to the callback function
              callback(data);
          });
      }
  };

  }]);


/**
 * dataFormatter
 * @return {[type]} [description]
 */
app.factory('dataFormatter', function(){
    return {
        auth : function(data){
            return data.root.auth.__cdata;
        },
        songs : function(data){
            var raw = data.root.song;
            
            var tracks = [];
            for(var x=0; x<raw.length; x++){
                var temp = {};
                temp['title'] = raw[x].title.__cdata;
                temp['url'] = raw[x].url.__cdata;
                temp['art'] = raw[x].art.__cdata;

                tracks.push(temp);
            }

            //return JSON.stringify(tracks);
            return tracks;
        },
        playlists : function(data){
          var raw = data.root.playlist;

          var playlists = [];

          for(var x=0; x<raw.length; x++){
            var temp = {};
            temp['name'] = raw[x].name.__cdata;
          }
          return raw;
        },
        albums : function(){
        }
    };
});

/**
 * player
 * @param  {[object]} audio      [description]
 * @param  {[object]} $rootScope [description]
 * @return {[object]}            [description]
 */
app.factory('player', function(audio, $rootScope){
    var player,
    playlist = [],
    paused = false,
    current = {
        track: 0,
    };

    player = {
      playlist: playlist,

      current: current,

      playing: false,

      art: "img/ionic.png",

      title: "No song loaded",

      play: function(track) {
          
          if (!playlist.length) return;

          if (angular.isDefined(track)) current.track = track;
          
          if (!paused) audio.src = playlist[current.track].url;
          audio.play();

          paused = false;
          player.playing = true;
          player.art = playlist[current.track].art;
          player.title = playlist[current.track].title;
          /*audio.addEventListener('timeupdate', function(){
            console.log(audio.currentTime);
          });*/
      },

      pause: function() {
      if (player.playing) {
          audio.pause();
          player.playing = false;
          paused = true;
      }
      },

      reset: function() {
          player.pause();
          current.track = 0;
      },

      next: function() {
          if (!playlist.length) return; //playlist empty
          paused = false;
          if (playlist.length > (current.track + 1)) {
            current.track++;
          } else {
            current.track = 0;
          }
          if (player.playing) player.play();
      },

      previous: function() {
          if (!playlist.length) return;
          paused = false;
          if (current.track > 0) {
            current.track--;
          } else {
            current.track = playlist.length - 1;
          }
          if (player.playing) player.play();
      }

    };

playlist.add = function(song) {
    if (playlist.indexOf(song) != -1) return;
    playlist.push(song);
};

playlist.remove = function(index){
    playlist.splice(index, 1);
};

//Check if audio has ended, if it is, continue to next
audio.addEventListener('ended', function() {
    //console.log("ended");
    $rootScope.$apply(player.next);
}, false);


return player;

});

// extract the audio for making the player easier to test
app.factory('audio', function($document) {
    var audio = $document[0].createElement('audio');
    return audio;
});