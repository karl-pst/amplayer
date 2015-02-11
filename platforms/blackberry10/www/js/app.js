// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

    //setup abstract state for home
    .state('home', {
      url: "/home",
      templateUrl: "templates/home.html",
      controller: "loginController"
    })

    // setup an abstract state for the tabs directive
    .state('tab', {
      url: "/tab",
      abstract: true,
      templateUrl: "templates/tabs.html"
    })

    // Each tab has its own nav history stack:
    .state('tab.player', {
      url: '/player',
      views: {
        'tab-player': {
          templateUrl: 'templates/tab-player.html',
          controller: 'DashCtrl'
        }
      }
    })

    .state('tab.playlist', {
      url: '/playlist',
      views: {
        'tab-playlist': {
          templateUrl: 'templates/tab-playlist.html',
          controller: 'PlayListCtrl'
        }
      }
    })

    .state('tab.playlist-detail', {
      url: '/playlist/:playlistId',
      views: {
        'tab-playlist': {
          templateUrl: 'templates/playlist-detail.html',
          controller: 'FriendDetailCtrl'
        }
      }
    })

    .state('tab.library', {
      url: '/library',
      views: {
        'tab-library': {
          templateUrl: 'templates/tab-library.html',
          controller: 'LibCtrl'
        }
      }
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/home');

});

