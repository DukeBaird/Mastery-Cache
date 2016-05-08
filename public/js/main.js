var app = angular.module('ritoApp', ['ngRoute']);

app.config(function($routeProvider) {
    $routeProvider
    .when('/', {
        templateUrl: 'setup',
        controller: 'setupController'
    })
    .when('/game', {
      templateUrl: 'game',
      controller: 'gameController'
    })
    .when('/gameOver', {
      templateUrl: 'gameOver',
      controller: 'endGameController'
    });
});

app.factory('masteryFactory', ['$http', '$q', function($http, $q) {

  var champions = [];
  var score = 0;
  var checkSummoner = function(name, region) {

    return $q(function(resolve, reject) {
      $http.get('/api/v1/topMastery', {
        headers: {},
        params: {
          summoner: name,
          region: region
        }
      }).then(function(data) {
        resolve(data.data);
      }, function(err) {
        reject(err);
      });
    });
  };

  var setChampions = function(champs) {
    champions = champs;
  };

  var setScore = function(scoreobj) {
    score = scoreobj;
  };

  var getChampions = function() {
    return champions;
  };

  var getScore = function() {
    return score;
  };

  return {
    checkSummoner: checkSummoner,
    setChampions: setChampions,
    setScore: setScore,
    getChampions: getChampions,
    getScore: getScore
  };

}]);

app.controller('setupController', ['$scope', '$q', '$location', '$http', 'masteryFactory', function($scope, $q, $location, $http, masteryFactory) {
  
  $scope.region = 'na';
  $scope.instructions = false;

  $scope.start = function() {
    $location.path('/game');
  };

  $scope.check = function() {
    $scope.err = true;
    $scope.errMsg = 'Checking summoner requirements...';
    masteryFactory.checkSummoner($scope.summoner, $scope.region ).then(function(data) {
      if (data.champions.length === 3) {
        $scope.errMsg = '';
        $scope.ready = true;
        masteryFactory.setChampions(data);
      } else {
        $scope.err = true;
        $scope.errMsg = "Minimum requirements not met";
      }
    }).catch(function(err) {
      if (err.status === 404) {
        $scope.err = true;
        $scope.errMsg = "Summoner not found";
      }
    });
  };

}]);

app.controller('gameController', ['$scope', '$q', '$location', 'masteryFactory', function($scope, $q, $location, masteryFactory) {

  var champions = masteryFactory.getChampions().champions;

  if (!champions) {
    $location.path('/');
    $scope.$apply();
  }

  $scope.champions = champions;
  $scope.time = 60;

  setInterval(function() {
    $scope.time--;
    $scope.$apply();
  }, 1000);

  var c = document.getElementById('canvas');

  var width = c.width = 350;
  var height = c.height = 500;
  var ctx = c.getContext('2d');

  $scope.score = {
    points: 0,
    mastery1: {
      level: 1,
      tokens: 0,
      needed: 5
    },
    mastery2: {
      level: 1,
      tokens: 0,
      needed: 5
    },
    mastery3: {
      level: 1,
      tokens: 0,
      needed: 5
    }
  };
  $scope.lives = score.lives;

  var opts = {
    numCoins: 0,
    maxCoins: 10,
    clicks: 0
  };

  var coins = [];

  function init() {
    
    for (var i = 0; i < opts.maxCoins; i++) {
      addNew();
    }
    
    loop();
  }

  function loop() {
    ctx.fillStyle = "#333333";
    ctx.fillRect(0, 0, width, height);
    
    for (var i = 0; i < opts.numCoins; i++) {
      var coin = coins[i];
      var drawing = new Image();
      if (coin.type < 11) {
        drawing.src = 'http://ddragon.leagueoflegends.com/cdn/6.9.1/img/champion/' + champions[0].key + '.png';
        ctx.drawImage(drawing, coin.x, coin.y, 20, 20);
      } else if (coin.type < 31) {
        drawing.src = '/images/Baron_Square.jpg';
        ctx.drawImage(drawing, coin.x, coin.y, 20, 20);
      } else if (coin.type < 61) {
        drawing.src = 'http://ddragon.leagueoflegends.com/cdn/6.9.1/img/champion/' + champions[1].key + '.png';
        ctx.drawImage(drawing, coin.x, coin.y, 20, 20);
      } else {
        drawing.src = 'http://ddragon.leagueoflegends.com/cdn/6.9.1/img/champion/' + champions[2].key + '.png';
        ctx.drawImage(drawing, coin.x, coin.y, 20, 20);
      }

      coin.y += coin.speed;
      
      if (coin.y > 500) {
        coins.splice(i, 1);
        opts.numCoins--;
        i--;
        addNew();
      }
    }

    if ($scope.time <= 0) {
      ctx.fillStyle = "#333333";
      ctx.fillRect(0, 0, width, height);
      masteryFactory.setScore($scope.score);
      $location.path('/gameOver').replace();
      $scope.$apply();
      return;
    }

    window.requestAnimationFrame(loop);
  }

  function addNew() {
    coins.push({
      x: Math.random() * 340,
      y: 0,
      size: 10,
      speed: Math.ceil(Math.random() * 3),
      type: Math.ceil(Math.random() * 100)
    });
    opts.numCoins++;
  }
  init();

  c.addEventListener("mousedown", function(e) {
    var click = {
      x: e.x - ((window.innerWidth/2) - 175) + 5,
      y: e.y - 20
    };
    opts.clicks++;

    for (var i = 0; i < opts.numCoins; i++) {
      var coin = coins[i];
      if (coin.x - 5 <= click.x && click.x <= coin.x + 25  && coin.y - 5 <= click.y && click.y <= coin.y + 25) {
        coins.splice(i, 1);
        opts.numCoins--;
        i--;
        
        if (coin.type < 11) {
          $scope.score.mastery1.tokens++;
          $scope.score.points += 50 * $scope.score.mastery1.level;
          if ($scope.score.mastery1.tokens >= $scope.score.mastery1.needed && $scope.score.mastery1.level < 5) {
            $scope.score.mastery1.level++;
            $scope.score.mastery1.tokens = 0;
            $scope.score.mastery1.needed += 5;
          }
        } else if (coin.type < 31) {
          $scope.score.points -= 100;
        } else if (coin.type < 61) {
          $scope.score.mastery2.tokens++;
          $scope.score.points += 30 * $scope.score.mastery2.level;
          if ($scope.score.mastery2.tokens >= $scope.score.mastery2.needed && $scope.score.mastery2.level < 5) {
            $scope.score.mastery2.level++;
            $scope.score.mastery2.tokens = 0;
            $scope.score.mastery2.needed += 5;
          }
        } else {
          $scope.score.mastery3.tokens++;
          $scope.score.points += 10 * $scope.score.mastery3.level;
          if ($scope.score.mastery3.tokens >= $scope.score.mastery3.needed && $scope.score.mastery3.level< 5) {
            $scope.score.mastery3.level++;
            $scope.score.mastery3.tokens = 0;
            $scope.score.mastery3.needed += 5;
          }
        }
        
        $scope.$apply();

        addNew();
      }
    }
    
  });

}]);

app.controller('endGameController', ['$scope', '$q', '$location', 'masteryFactory', function($scope, $q, $location, masteryFactory) {

  var champions = masteryFactory.getChampions().champions;

  if (!champions) {
    $location.path('/');
    $scope.$apply();
  }

  var score = masteryFactory.getScore();
  $scope.score = score;

  $scope.share = function() {
    FB.ui({
      method: 'feed',
      link: 'https://mastery-cache.herokuapp.com/',
      caption: 'I just scored ' + score.points + ' points in Mastery Cache!'
    }, function(response){});
  };

  $scope.playAgain = function() {
    $location.path('/game');
  };

  $scope.restart = function() {
    $location.path('/');
  };

}]);
