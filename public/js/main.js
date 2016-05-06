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

  var checkSummoner = function(name) {

    var region = 'na';

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
      // resolve({
      //   champions: [
      //     'Caitlyn',
      //     'Zac',
      //     'Brand'
      //   ]
      // });
    });
  };

  var setChampions = function(champs) {
    champions = champs;
  };

  var getChampions = function() {
    return champions;
  };

  return {
    checkSummoner: checkSummoner,
    setChampions: setChampions,
    getChampions: getChampions
  };

}]);

app.controller('setupController', ['$scope', '$q', '$location', '$http', 'masteryFactory', function($scope, $q, $location, $http, masteryFactory) {
  $scope.start = function() {
    $location.path('/game');
  };

  $scope.check = function() {
    masteryFactory.checkSummoner($scope.summoner).then(function(data) {
      console.log(data);
      if (data.champions.length === 3) {
        $scope.ready = true;
        masteryFactory.setChampions(data);
      } else {
        // err, not enougn champs, or just random?
      }
    });
  };

}]);

app.controller('gameController', ['$scope', '$q', '$location', 'masteryFactory', function($scope, $q, $location, masteryFactory) {

  var champions = masteryFactory.getChampions().champions;
  console.log(champions);

  var c = document.getElementById('canvas');

  var width = c.width = 350;
  var height = c.height = 500;
  var ctx = c.getContext('2d');

  $scope.runAnimation = true;

  var score = {
    points: 0,
    mastery1: 0,
    mastery2: 0,
    mastery3: 0,
    lives: 3
  };

  $scope.score = score.points;
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
    if ($scope.runAnimation) {
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
      
      if(score.lives <= 0) {
        ctx.fillStyle = "#333333";
        ctx.fillRect(0, 0, width, height);
        console.log(score);
        $location.path('/gameOver').replace();
        $scope.$apply();
        return;
      }
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
    if (!$scope.runAnimation) return;
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
          score.mastery1++;
          score.points += 50;
        } else if (coin.type < 31) {
          score.lives--;
        } else if (coin.type < 61) {
          score.mastery2++;
          score.points += 30;
        } else {
          score.mastery3++;
          score.points += 10;
        }
        
        $scope.score = score.points;
        $scope.lives = score.lives;
        $scope.$apply();

        addNew();
      }
    }
    
  });

  $scope.runPause = function() {
    $scope.runAnimation = !$scope.runAnimation;
  };

}]);

app.controller('endGameController', ['$scope', '$q', '$location', function($scope, $q, $location) {

  $scope.playAgain = function() {
    $location.path('/game');
  };

  $scope.restart = function() {
    $location.path('/');
  };

}]);
