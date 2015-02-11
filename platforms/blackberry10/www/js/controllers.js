var app = angular.module('starter.controllers', []);

app.controller('DashCtrl', function($scope) {
});

app.controller('PlayListCtrl', function($scope, Playlist, dataSource, dataFormatter) {
  //$scope.playlists = Playlist.all();

  var auth = localStorage.getItem("auth");

  var request = dataSource.getPlaylists(auth, '*', false);
   
   request.then(function(obj){
        $scope.playlists = dataFormatter.playlists(obj.data);
        console.log($scope.playlists);
   });

});

app.controller('FriendDetailCtrl', function($scope, $stateParams, Playlist) {
  $scope.playlist = Playlist.get($stateParams.playlistId);
});

app.controller('LibCtrl', function($scope) {
});


app.controller('playerController', function($scope, player, dataSource, dataFormatter) {

    var auth = localStorage.getItem("auth");
    //console.log("playerController: "+auth);
    $scope.player = player;
             
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

app.controller('loginController', function($scope, $location, dataSource, dataFormatter){

    $scope.login = function(){

        var request = dataSource.getAuth($scope.username, $scope.password);

        request.then(function(obj){

            $scope.auth = dataFormatter.auth(obj.data);

            if($scope.auth){
                localStorage.setItem("auth", $scope.auth);
                $location.url("/tab/player");
            }
            
        });
        
    };
});