(function () {
  'use strict';

  var fuseUrl = 'http://54.84.50.254/facets?auto_conf=facetOptions&facets=&highlight=true&q=&value=';
  var $userInput = $('#UserInput');
  var $searchResults = $('.SearchResults');

  var autocompleteFields = ['hashtags', 'screen_name', 'time_zone'];

  var userInputObservable = Rx.Observable.fromEvent($userInput, 'keyup')
    .select(function(e) {
      return e.target.value;
    })
    .throttle(150)
    .distinctUntilChanged();

  var searcher = userInputObservable.select(function(text) {
    if(text.length > 0) {
      return Rx.Observable.fromPromise(
        $.ajax(
          {
            url: fuseUrl + text,
            dataType: 'json',
            headers: {
              'x-user-id': '%2268e3325b-a14b-499c-9b7e-fb7830ac3a91%22'
            }
          }
        )
      );
    }
    else {
      return Rx.Observable.returnValue('empty');
    }
  })
    .switchLatest();

  var subscription = searcher.subscribe(function(data) {
    var selectedData;

    if(data === 'empty') {
      selectedData = '<li class="empty">Results here</li>';
    }
    else {

      selectedData = _.chain(data.items)
        .filter(function(item) {
          return _.contains(autocompleteFields, item.name);
        })
        .map(function(item) {
          var title = '<h3>' + item.label + '</h3>';
          var highlight;
          var chopped;
          var contents = _.map(item.items, function(c) {
            highlight = c.value.substr(c.highlights[0][0], c.highlights[0][1]);
            chopped = c.value.replace(highlight,  '');

            return '<li><a href="' +
              c.and_query +
              '"><span class="value">' +
              highlight +
                '<strong>' +
                chopped +
                '</strong>' +
              '</span><span class="freq">' +
              c.freq +
              '</span></a></li>';
          }).join('');

          return title + contents;

        })
        .value().join('');
    }

    $searchResults.html(selectedData);
  });

})();