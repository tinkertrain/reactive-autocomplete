(function() {
  'use strict';

  angular
    .module('app', ['rx'])
    .factory('queryFuse', queryFuse)
    .controller('mainController', mainController);


  //=========================
  // SERVICE: queryFuse
  //=========================

  queryFuse.$inject = ['$http', '$q', 'rx'];

  /* @ngInject */
  function queryFuse($http, $q, rx) {
    /* jshint validthis: true */

    var service = {
      getData: getData
    };

    return service;

    ////////////////

    function getData(text) {
      var fuseUrl = 'http://54.84.50.254/facets?auto_conf=facetOptions&facets=&highlight=true&q=&value=';
      var headers = {
        'x-user-id': '%2268e3325b-a14b-499c-9b7e-fb7830ac3a91%22'
      };

      if(!angular.isUndefined(text) && text.length > 0) {
        var deferred = $q.defer();

        $http({
          url: fuseUrl + text,
          method: 'GET',
          headers: headers
        }).then(success, error);

        return rx.Observable
          .fromPromise(deferred.promise)
          .retry(10) // Retry 10 times then give up
          .map(function(response) {
            return response.data.items;
          });

      }
      else {
        return Rx.Observable.returnValue('empty');
      }

      ////////////

      function success(response) {
        deferred.resolve(response);
      }

      function error(msg) {
        deferred.reject(msg);
      }

    }

  }

  //============================
  // CONTROLLER: mainController
  //============================

  mainController.$inject = ['$scope', '$timeout','observeOnScope', 'queryFuse'];

  /* @ngInject */
  function mainController($scope, $timeout, observeOnScope, queryFuse) {
    /* jshint validthis: true */
    var vm = this;
    vm.results = [];



    $scope
      .$toObservable('vm.userInput')
      .throttle(300)
      .map(function(text) {
        return text.newValue;
      })
      .distinctUntilChanged()
      .select(queryFuse.getData)
      .switchLatest()
      .subscribe(function(data) {
        $timeout(function() {
          vm.results = prepareData(data);
        }, 0);
      });

    //////////////////////

    var autocompleteFields = ['hashtags', 'screen_name', 'time_zone'];

    function prepareData(data) {

      var selectedData = [];

      if(data !== 'empty') {
        selectedData = _.chain(data)
          .filter(function(item) {
            return _.contains(autocompleteFields, item.name);
          })
          .map(function(item) {

            return {
              label: item.label,
              items: _.map(item.items, function(c) {
                c.highlight = c.value.substr(c.highlights[0][0], c.highlights[0][1]);
                c.chopped = c.value.replace(c.highlight, '');

                return c;
              })
            };
          })
          .value();
      }

      return selectedData;

    }


  }



})();