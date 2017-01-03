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
    this.state = {
      selectedValues: props.origSelectedValues,
    };
  }
  handleValueChange(event) {
    let date_value = event.target.value;
    
   /* const selectedValues = Object.assign({}, this.state.selectedValues);
    selectedValues['__from'] = date_value;
    selectedValues['__to'] = date_value;*/
    
    let oneweek = 604800000;
    for (var i = 0; i < window.charts.length; i++) {
      console.log(window.charts[i]);
      window.charts[i].brushExtent([new Date(date_value).getTime() - oneweek, new Date(date_value).getTime() + oneweek]);
      window.charts[i].update();
    }
    /*this.setState({ selectedValues });
    console.log(selectedValues);
    console.log(this.state.selectedValues);
    this.props.onChange('__from', date_value);
    this.props.onChange('__to', date_value);
    console.log(selectedValues);
    console.log(this.state.selectedValues);*/
  }
  render() {
    return (
      <div>
          <div className="m-b-5">
              <input
                ref="date"
                type="date"
                name="target_date"
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
