var app = angular.module('starter.controllers', []);

app.controller('DashCtrl', function($scope) {
});

app.controller('PlayListCtrl', function($scope, $location, Playlists, dataFormatter, loader, dataSource, popup) {
  var auth = localStorage.getItem('auth');
  // var request = Playlists.request(auth, '*', false);
  var request = dataSource.getPlaylists(auth, '*', false);

  request.then(function(obj){
    loader.hide();
    result = dataFormatter.playlists(obj.data);
      if (result.code) {
        popup.showAlert('Session expired', 'Please login to your account.');
        $location.url("/");
      }else{
        $scope.playlists = result;
      }
  });

});

app.controller('LibraryCtrl', function($scope, Tags, Tag, dataFormatter){
  var auth = localStorage.getItem('auth');

  $scope.genres = [
  {
   'name' : 'Pop',
   'id': 29,
  },
  {
    'name' : 'Rock',
    'id' : 42
  },
  {
    'name': 'Punk',
    'id' : 71,
  },
  {
    'name' : 'OPM',
    'id' : 67
  },
  {
    'name' : 'Dance',
    'id' : 55
  },
  {
    'name' : 'OST',
    'id' : 48
  },
  {
    'name' : 'Blues',
    'id' : 61
  },
  {
    'name' : 'Hip Hop',
    'id' : 103
  },
  {
    'name' : 'Metal',
    'id' : 105
  },
  {
    'name' : 'Electronic Rock',
    'id' : 104
  },
  {
    'name' : 'KPop',
    'id' : 28
  },
  {
    'name' : 'JRock',
    'id' : 97
  },
  {
    'name' : 'Pop Rock',
    'id' : 54
  }];
  //pop 29
  //rock => 22
  //punk 71
  //opm 67
  //dance 55
  //ost 48
  //blues 61
  //hip hop 103
  //metal 105
  //electronic rock 104
  //kpop 28
  //jrock 97
  //pop rock 54
  
  // console.log($scope.genres.length);
  
  /*var request = Tags.request(auth, $scope.genres[1].name, true);

  request.then(function(obj){
    // console.log(obj.data);
    $scope.tags = dataFormatter.tags(obj.data);

    console.log(obj.data.root.tag._id);
  });*/
  
  height = angular.element('.col-50').css('width');
  angular.element('.col-50').css('height', height);


});

app.controller('LibraryDetailCtrl', function($scope, $stateParams, loader, Tag, player, TagSongs, dataFormatter){

  $scope.player = player;

  var auth = localStorage.getItem('auth');

  var tag_request = Tag.request(auth, $stateParams.libraryId);
  tag_request.then(function(obj){
    $scope.tag = dataFormatter.tags(obj.data);
  });

  var tag_song_request = TagSongs.request(auth, $stateParams.libraryId);
  tag_song_request.then(function(obj){
    $scope.songs = dataFormatter.songs(obj.data);
    if($scope.songs){
      loader.hide();
    }
  });

});

app.controller('PlaylistDetailCtrl', function($scope, $stateParams, player, dataFormatter, dataSource, loader) {
  //$stateParams.playlistId - get the parameter on url  
    
  $scope.player = player;
  var auth = localStorage.getItem("auth");

  var request = dataSource.getPlaylist(auth, $stateParams.playlistId);
  request.then(function(obj){
    $scope.playlist = dataFormatter.playlists(obj.data);
  });
  
  var request2 = dataSource.getPlaylistSongs(auth, $stateParams.playlistId);
  request2.then(function(obj){
    $scope.songs = dataFormatter.songs(obj.data);
    if($scope.songs){
      loader.hide();
    }
  });


});

app.controller('PlayerController', function($rootScope, $timeout, $scope, player, audio) {

  $scope.player = player;

  doubleZero = '00';

  //initialize values
  $scope.data = {};
  $scope.sec = doubleZero;
  $scope.min = doubleZero;
  $scope.max = doubleZero;
  $scope.mm = doubleZero;
  $scope.ss = doubleZero;
  $scope.data.seek = '0';

  //triggered by ngChange to update audio.currentTime
  $scope.seeked = function(){
    audio.currentTime = this.data.seek;
  };

  s = parseInt($scope.player.duration %60, 10);
  m = parseInt(($scope.player.duration / 60) % 60, 10);

  $scope.sec = ('0' + s).slice(-2);
  $scope.min = ('0' + m).slice(-2);

  $scope.updateUI = function(min, sec, seek, max){
    $scope.ss = ('0' + sec).slice(-2);
    $scope.mm = ('0' + min).slice(-2);
    $scope.max = max;
    $scope.data.seek = seek;
  };

  audio.addEventListener('timeupdate', function(){

    sec = parseInt(audio.currentTime % 60, 10);
    min = parseInt((audio.currentTime / 60) % 60, 10);
    seek = audio.currentTime;
    max = audio.duration;

    $timeout(function(){
        $scope.updateUI(min, sec, seek, max);
    }, 0);
        
    //angular.element('#seek').val(audio.currentTime);      
           
  });

  
  visible = false;
  plength = $scope.player.playlist.length;


  $scope.toggleQueue = function(){
    if(!visible && plength > 0){
      angular.element("#queue").slideDown();
      visible = true;
    }else{
      angular.element("#queue").slideUp();
      visible = false;
    }
  };


});

app.controller('SessionController', function($scope, $location, $ionicSideMenuDelegate, $ionicModal, session, dataFormatter, loader, popup){

    $scope.session = session;

    $scope.loginForm = {
      username : "",
      password : ""
    };

    /*$ionicModal.fromTemplateUrl('templates/modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $scope.openModal = function() {
      $scope.modal.show();
    };

    $scope.closeModal = function() {
      $scope.modal.hide();
    };*/

    $scope.login = function(){

      session.login($scope.loginForm.username, $scope.loginForm.password);

      var request = session.request;

      request.then(function(obj){
        loader.hide();
        if(!obj.data){
          popup.showAlert("Invalid Login!", "Incorrect username or password.");
          //reset inputs
          $scope.loginForm.username = '';
          $scope.loginForm.password = '';
        }else{
          $scope.auth = dataFormatter.auth(obj.data);
          if($scope.auth){
              localStorage.setItem("auth", $scope.auth);
              $location.url("/tab/player");
          }
        }
      });

      request.error(function(obj){
        loader.hide();
        popup.showAlert("Timeout", "No connection to server!");
      });
    
    };
    

});


app.controller('browseController', function(dataSource, dataFormatter){

  var auth = localStorage.getItem("auth");

  //This is the callback function
    setData = function(data) {
       $scope.songs = dataFormatter.songs(data);
    };
    
    if(auth){
        dataSource.getSongs(auth, setData);
    }else{
        $scope.error = "No valid session!";
    }
});