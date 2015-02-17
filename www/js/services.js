var app = angular.module('starter.services', []);

/**
 * A simple example service that returns some data.
 */
app.factory('Playlists', function(dataSource) {
  return {
    request: function(auth, filter, exact){
      return dataSource.getPlaylists(auth, filter, exact);
    }
  };
  /*return {
    all: function() {
      return "me";
    },
    get: function(playlistId) {
      // Simple index lookup
      return playlists[playlistId];
    }
  };*/
});

app.factory('Tags', function(dataSource){
  return {
    request: function(auth, filter, exact){
      return dataSource.getTags(auth, filter, exact);
    }
  };
});

app.factory('Tag', function(dataSource){
  return {
    request: function(auth, filter){
      return dataSource.getTag(auth, filter);
    }
  };
});

app.factory('TagSongs', function(dataSource){
  return {
    request: function(auth, filter){
      return dataSource.getTagSongs(auth, filter);
    }
  };
});

app.factory('loader', function($rootScope, $ionicLoading){
  return {
    show: function(){
      $rootScope.loading = $ionicLoading.show({
        templateUrl: "templates/loader.html"
      });
    },
    hide: function(){
      $ionicLoading.hide();
    }
  };
});

app.factory('PlaylistSongs', function(dataSource){
  return {
    request: function(auth, filter){
      return dataSource.getPlaylistSongs(auth, filter);
    }
  };
});

/**
 * dataSource
 * @param  {[type]} $http     [description]
 * @param  {[type]} $location [description]
 * @return {[type]}           [description]
 */
app.factory('dataSource', function($http, $location, loader){

  var time = Math.floor(new Date().getTime() / 1000);

  var key = function(password){
      return sha256(password);
      };

  var passphrase = function(password){
      return sha256(time + key(password));
      };

  var server_url = 'http://localhost/server/xml.server.php';

  return {
      getAuth: function(username, password){
        loader.show();
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
                var x2js = new X2JS();
                var json = x2js.xml_str2json( data );
                return json;
            }
        };

        var promise = $http(config);
        
        return promise;
     
        
      },
      getPlaylist: function(auth, filter){
        loader.show();
        var config = {
            method: 'get',
            url: server_url,
            params: {
              action: 'playlist',
              auth: auth,
              filter: filter,
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

      getPlaylists: function(auth, filter, exact){
        loader.show();
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

      getPlaylistSongs: function(auth, filter){
        loader.show();
        var config = {
          method: 'get',
          url: server_url,
          params: {
            action: 'playlist_songs',
            auth: auth,
            filter: filter
          },
          transformResponse: function(data){
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
      },

      getTags: function(auth, filter, exact){
        //loader.show();
        var config = {
          method: 'get',
          url: server_url,
          params: {
            action: 'tags',
            auth: auth,
            filter: filter,
            exact: exact
          },
          transformResponse: function(data){
            var x2js = new X2JS();
            var json = x2js.xml_str2json( data );
            return json;
          }
        };

        var promise = $http(config);

        return promise;
      },

      getTag: function(auth, filter){
        //loader.show();
        var config = {
          method: 'get',
          url: server_url,
          params: {
            action: 'tag',
            auth: auth,
            filter: filter
          },
          transformResponse: function(data){
            var x2js = new X2JS();
            var json = x2js.xml_str2json( data );
            return json;
          }
        };

        var promise = $http(config);

        return promise;
      },

      getTagSongs: function(auth, filter){
        loader.show();
        var config = {
          method: 'get',
          url: server_url,
          params: {
            action: 'tag_songs',
            auth: auth,
            filter: filter
          },
          transformResponse: function(data){
            var x2js = new X2JS();
            var json = x2js.xml_str2json( data );
            return json;
          }
        };

        var promise = $http(config);

        return promise;
      },
  };

  });


/**
 * dataFormatter
 * @return {[type]} [description]
 */
app.factory('dataFormatter', function(){
    return {
        auth : function(data){
          console.log(data);
          return data.root.auth.__cdata;
        },
        songs : function(data){
            var raw = data.root.song;
            
            var tracks = [];

            if(raw.length){ //more than one song
              for(var x=0; x<raw.length; x++){
                temp = {};
                temp['title'] = raw[x].title.__cdata;
                temp['url'] = raw[x].url.__cdata;
                temp['art'] = raw[x].art.__cdata;
                temp['duration'] = raw[x].time;
                tracks.push(temp);
              }
            }else{
              temp = {};
              temp['title'] = raw.title.__cdata;
              temp['url'] = raw.url.__cdata;
              temp['art'] = raw.art.__cdata;
              temp['duration'] = raw.time;
              tracks.push(temp);
            }
            
            return tracks;
        },
        playlists : function(data){

          var raw = data.root.playlist;
          var playlists = [];

          if(!raw){ //if playlist is return or an error
            var error = {
              'code' : data.root.error._code,
              'message' : data.root.error.__cdata,
            };

            return error;
          }else{
            if(raw.length){ //if more than one playlist
              for(var x=0; x<raw.length; x++){
                temp = {};
                temp['id'] = raw[x]._id;
                temp['name'] = raw[x].name.__cdata;
                temp['owner'] = raw[x].owner.__cdata;
                temp['type'] = raw[x].type;
                temp['items'] = raw[x].items;
                playlists.push(temp);
              }
            }else{
              playlists.name = raw.name.__cdata;
              playlists.owner = raw.owner.__cdata;
            }
            

            return playlists;
          }

          
        },
        tags : function(data){

          var raw = data.root.tag;
          
          var tag = {};

          tag['id'] = raw._id;
          tag['name'] = raw.name.__cdata;
          tag['albums'] = raw.albums;
          tag['artists'] = raw.artists;
          tag['songs'] = raw.songs;
          
          return tag;
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
app.factory('player', function(audio, $rootScope, $location){
    var player,
    queue = [], //array of functions    
    paused = false,
    art = "img/ionic.png",
    title = "No song loaded",
    duration = '00',
    current = {
        track: 0,
    };    

    player = {

      playlist : [],

      queue : queue,

      current : current,

      playing : false,

      repeatState : false,

      shuffleState : false,

      repeatCheck : false,

      albumArt : art,

      songTitle : title,

      duration : duration,

      play: function(track) {

          $location.url("tab/player");
          
          if (!player.playlist.length) return;

          player.setter(track);

          audio.play();
          paused = false;
          player.playing = true;
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
          player.playlist = [];
          player.albumArt = art;
          player.songTitle = title;
          player.duration = duration;
      },

      setter: function(track){

        playlistLen = player.playlist.length;
        temp = [];
        for(i = 0; i<playlistLen; i++){
          temp[i] = i;
        }

        tempTrack = window.knuthShuffle(temp.slice(0));
        console.log(tempTrack);

        if (angular.isDefined(track)){
          current.track = track;
          audio.src = player.playlist[current.track].url;
        }else{
          if (!paused) audio.src = player.playlist[current.track].url;
        }
        player.albumArt = player.playlist[current.track].art;
        player.songTitle = player.playlist[current.track].title;
        player.duration = player.playlist[current.track].duration;
      },

      repeat: function(){

        player.repeatState = !player.repeatState ? true : false;

      },

      shuffle: function(){

        player.shuffleState = (!player.shuffleState) ? true : false;

        
        // player.playlist = window.knuthShuffle(player.playlist.slice(0));

      },

      next: function() {

          if (!player.playlist.length) return; //player.playlist empty
          paused = false;
          if (player.playlist.length > (current.track + 1)) {
            current.track++;
          } else {
            player.repeatCheck = true;
            current.track = 0;
          }

          if (player.repeatCheck) {
            player.repeatCheck = false;
            if (!player.repeatState) {
              player.setter();
              player.pause();
            }
          }

          if (player.playing){
            player.play();
          }
      },

      previous: function() {
          if (!player.playlist.length) return;
          paused = false;
          if (current.track > 0) {
            current.track--;
          } else {
            current.track = player.playlist.length - 1;
          }

          if (player.playing) {
            player.play();
          }
      }
    };

    /**
     * add tracks to queue
     * @param {[object]} songs [object of songs from a player.playlist/album/tag cloud]
     * @param {[string]} title [title of song selected, used to determine song track to play, could be undefined]
     */
    queue.add = function(songs, title) {

        selected = 0;

        len = songs.length;

        player.reset();

        for(var i=0; i<len; i++){
          
          //check if song exist, there's an issue when view is changed... songs get added twice when same list is added, better compare with the current queue
          if (player.playlist.indexOf(songs[i]) != -1) return;
          player.playlist.push(songs[i]);

          //play selected track
          if(title !== undefined && songs[i].title === title){
            selected = i;
          }
          
        }

        player.play(selected);
        // player.albumArt = player.playlist[current.track].art;
        // player.songTitle = player.playlist[current.track].title;
        // player.duration = player.playlist[current.track].duration;
    };

    queue.remove = function(index){
        player.playlist.splice(index, 1);
    };

    //Check if audio has ended, if it is, continue to next
    audio.addEventListener('ended', function() {
        $rootScope.$apply(player.next);
    }, false);


return player;

});

// extract the audio for making the player easier to test
app.factory('audio', function($document) {
    var audio = $document[0].createElement('audio');
    return audio;
});

app.factory('session', function(player, dataSource){
    var session;

    session = {
        login: function(username, password){
          session.request = dataSource.getAuth(username, password);
        },
        logout: function(){

          //reset player
          player.reset();

          //destroy session
          localStorage.removeItem("auth");
        }
    };

    return session;
});

app.factory('myHttpInterceptor', function($q, $rootScope){
  return {
    request: function(config){
      //$rootScope.$broadcast('loading-started');
      return config || $q.when(config);
    },
    response: function(response){
      //$rootScope.$broadcast('loading-complete');
      return response || $q.when(response);
    }
  };
});

app.factory('popup', function($ionicPopup){

  return {
    showAlert : function(title, template){
      var alertPopup = $ionicPopup.alert({
        title: title,
        template: template
      });

      alertPopup.then(function(res) {
        //popup close, do nothing
      });
    }

  };

});