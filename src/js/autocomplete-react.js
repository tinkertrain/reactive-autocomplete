'use strict';

var fuseUrl = 'http://54.84.50.254/facets?auto_conf=facetOptions&facets=&highlight=true&q=&value=';

var Autocomplete = React.createClass({displayName: 'Autocomplete',
  getInitialState: function() {
    return {
      data: []
    };
  },
  handleResultsUpdate: function(data) {
    this.setState({
      data: data
    });
  },
  render: function() {
    return (
      React.createElement("div", null, 
        React.createElement(AutocompleteForm, {updateResults: this.handleResultsUpdate}), 
        React.createElement(SearchResultsList, {items: this.state.data})
      )
    );
  }
});

var AutocompleteForm = React.createClass({displayName: 'AutocompleteForm',
  subjects: ['keyUp'],

  autocompleteFields: ['hashtags', 'screen_name', 'time_zone'],

  componentWillMount: function () {
    if (!this.subjects) return;

    var eventHandlers = {},
      subjects = {};

    this.subjects.forEach(function (key) {
      var subject = new Rx.Subject();

      eventHandlers[key] = subject.onNext.bind(subject);
      subjects[key] = subject;
    });

    this.handlers = eventHandlers;
    this.subjects = subjects;
  },

  componentDidMount: function () {
    if (!this.subjects) return;

    var streams = this.fireStreams();
  },

  componentWillUnmount: function () {
    if (!this.subjects) return;

    for (var key in this.subjects) {
      this.subjects[key].dispose();
    }
  },

  fireStreams: function() {
    var s = this.subjects;
    var that = this;


    s.keyUp
      .map(function(event) {
          return event.target.value;
        })
      .throttle(150)
      .distinctUntilChanged()
      .map(function(text) {
        if (text.length > 0) {
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
      .switchLatest()
      .subscribe(function(data) {
        that.selectedData = [];

        if (data !== 'empty') {
          that.selectedData = _.chain(data.items)
            .filter(function (item) {
              return _.contains(that.autocompleteFields, item.name);
            })
            .map(function(item) {
              return {
                label: item.label,
                items: _.map(item.items, function (c) {
                  c.highlight = c.value.substr(c.highlights[0][0], c.highlights[0][1]);
                  c.chopped = c.value.replace(c.highlight, '');

                  return c;
                })
              };
            })
            .value();
        }

        that.props.updateResults(that.selectedData);

      });


    return {};
  },
  render: function() {
    return (
      React.createElement("form", {className: "SearchForm"}, 
        React.createElement("div", {className: "row collapse"}, 
          React.createElement("div", {className: "small-3 large-2 columns"}, 
            React.createElement("label", {htmlFor: "UserInput", className: "prefix"}, "Type Search")
          ), 
          React.createElement("div", {className: "small-9 large-10 columns"}, 
            React.createElement("input", {type: "search", id: "UserInput", onKeyUp: this.handlers.keyUp})
          )
        )
      )
    );
    }
});

var SearchResultsList = React.createClass({displayName: 'SearchResultsList',
  render: function() {
    return (
      React.createElement("ul", {className: "SearchResults"}, 
        
          this.props.items.map(function(item) {
            return React.createElement(SearchResultItem, {label: item.label, items: item.items, key: item.label})
          })
        
      )
    );
  }
});

var SearchResultItem = React.createClass({displayName: 'SearchResultItem',
  render: function() {
    return (
      React.createElement("div", null, 
        React.createElement("h3", null, this.props.label), 
        
          this.props.items.map(function(item) {
            return (
              React.createElement("li", {key: item.value}, 
                React.createElement("a", {href: item.and_query}, 
                  React.createElement("span", {className: "value"}, item.highlight, React.createElement("strong", null, item.chopped)), 
                  React.createElement("span", {className: "freq"}, item.freq)
                )
              )
            );
          })
        
      )
    );
  }
});


React.render( React.createElement(Autocomplete, null) , document.querySelector('.Autocomplete'));