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

class DateFilterSlider extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedValues: props.origSelectedValues,
    };
  }
  /*changeFilter(filter, options) {
    let vals = null;
    if (options) {
      if (Array.isArray(options)) {
        vals = options.map((opt) => opt.value);
      } else {
        vals = options.value;
      }
    }
    const selectedValues = Object.assign({}, this.state.selectedValues);
    selectedValues[filter] = vals;
    this.setState({ selectedValues });
    this.props.onChange(filter, vals);
  }*/
  handleValuesChange(event) {
    let num_value = Number(event.target.value);
    let from_value = num_value + 20 + ' years ago'
    let to_value = num_value + ' years ago'
    
    const selectedValues = Object.assign({}, this.state.selectedValues);
    selectedValues['__from'] = from_value;
    selectedValues['__to'] = to_value;
    
    this.setState({ selectedValues });
    console.log(selectedValues);
    console.log(this.state.selectedValues);
    this.props.onChange('__from', from_value);
    this.props.onChange('__to', to_value);
    console.log(selectedValues);
    console.log(this.state.selectedValues);
  }
  render() {
    return (
      <div>
          <div className="m-b-5">
              <input
                ref="range"
                type="range"
                min="0"
                max="100"
                defaultValue="0"
                onChange={this.handleValuesChange.bind(this)}
              />
          </div>
      </div>
    );
  }
}
DateFilterSlider.propTypes = propTypes;
DateFilterSlider.defaultProps = defaultProps;

function dateFilterSlider(slice) {
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
        <DateFilterSlider
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

module.exports = dateFilterSlider;
