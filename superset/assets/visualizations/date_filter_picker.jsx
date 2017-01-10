// JS
const $ = require('jquery');
import d3 from 'd3';

import React from 'react';
import ReactDOM from 'react-dom';

import Select from 'react-select';
import '../stylesheets/react-select/select.less';

import './filter_box.css';
import { TIME_CHOICES } from './constants.js';

const propTypes = {
  origSelectedValues: React.PropTypes.object,
  filtersChoices: React.PropTypes.object,
  onChange: React.PropTypes.func,
  showDateFilter: React.PropTypes.bool,
};

const defaultProps = {
  origSelectedValues: {},
  onChange: () => {},
  showDateFilter: false,
};

class DateFilterPicker extends React.Component {
  constructor(props) {
    super(props);
    this.state = { day: new Date().toISOString().slice(0,10) };
  }
  handleValueChange(event) {
    let date_value = event.target.value;
    
    let oneweek = 604800000;
    for (var i = 0; i < window.charts.length; i++) {
      console.log(window.charts[i]);
      window.charts[i].brushExtent([new Date(date_value).getTime() - 3 * oneweek, new Date(date_value).getTime() + 3 * oneweek]);
      window.charts[i].update();
    }

    console.log(date_value);
    this.setState({day: date_value});
    this.props.onChange('__from', date_value + ' yesterday'); // surprisingly, this works
    this.props.onChange('__to', date_value);
    window.__from = new Date(date_value).getTime() - 5 * oneweek;
    window.__to = new Date(date_value).getTime() + 5 * oneweek;
  }
  render() {
    let today = new Date(); 
    let yyyy = today.getFullYear();
    let dd = today.getDate();
    let mm = today.getMonth()+1; //January is 0!
    return (
      <div>
          <div className="m-b-5">
              <input
                ref="date"
                type="date"
                name="target_date"
                value= { this.state.day }
                onChange={this.handleValueChange.bind(this)}
              />
          </div>
      </div>
    );
  }
}
DateFilterPicker.propTypes = propTypes;
DateFilterPicker.defaultProps = defaultProps;

function dateFilterPicker(slice) {
  const d3token = d3.select(slice.selector);

  const refresh = function () {
    d3token.selectAll('*').remove();

    // filter box should ignore the dashboard's filters
    const url = slice.jsonEndpoint({ extraFilters: false });
    $.getJSON(url, (payload) => {
      const fd = payload.form_data;
      const filtersChoices = {};
      // Making sure the ordering of the fields matches the setting in the
      // dropdown as it may have been shuffled while serialized to json
      payload.form_data.groupby.forEach((f) => {
        filtersChoices[f] = payload.data[f];
      });
      ReactDOM.render(
        <DateFilterPicker
          filtersChoices={filtersChoices}
          onChange={slice.setFilter}
          showDateFilter={fd.date_filter}
          origSelectedValues={slice.getFilters() || {}}
        />,
        document.getElementById(slice.containerId)
      );
      slice.done(payload);
    })
    .fail(function (xhr) {
      slice.error(xhr.responseText, xhr);
    });
  };
  return {
    render: refresh,
    resize: () => {},
  };
}

module.exports = dateFilterPicker;
