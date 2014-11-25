'use strict';

var fuseUrl = 'http://54.84.50.254/facets?auto_conf=facetOptions&facets=&highlight=true&q=&value=';

var Autocomplete = React.createClass({
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
      <div>
        <AutocompleteForm updateResults={this.handleResultsUpdate} />
        <SearchResultsList items={this.state.data} />
      </div>
    );
  }
});

var AutocompleteForm = React.createClass({
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
      <form className="SearchForm">
        <div className="row collapse">
          <div className="small-3 large-2 columns">
            <label htmlFor="UserInput" className="prefix">Type Search</label>
          </div>
          <div className="small-9 large-10 columns">
            <input type="search" id="UserInput" onKeyUp={this.handlers.keyUp} />
          </div>
        </div>
      </form>
    );
    }
});

var SearchResultsList = React.createClass({
  render: function() {
    return (
      <ul className="SearchResults">
        {
          this.props.items.map(function(item) {
            return <SearchResultItem label={item.label} items={item.items} key={item.label} />
          })
        }
      </ul>
    );
  }
});

var SearchResultItem = React.createClass({
  render: function() {
    return (
      <div>
        <h3>{this.props.label}</h3>
        {
          this.props.items.map(function(item) {
            return (
              <li key={item.value}>
                <a href={item.and_query}>
                  <span className="value">{item.highlight}<strong>{item.chopped}</strong></span>
                  <span className="freq">{item.freq}</span>
                </a>
              </li>
            );
          })
        }
      </div>
    );
  }
});


React.render( <Autocomplete /> , document.querySelector('.Autocomplete'));