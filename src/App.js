import React, { Component } from "react";

class App extends Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      outdoorData: {},
      indoorData: {},
      humidityData: {},
      averageIndoorTempRounded: null,
      averageOutdoorTempRounded: null,
      thermostatMode: null,
      uidHash: localStorage.uidHash,
      desiredTemperature: localStorage.desiredTemperature,
      todayDate: null,
      currentTime: null,
      humidity: null
    };
    this.handleThermostatModeHeat = this.handleThermostatModeHeat.bind(this);
    this.handleThermostatModeCool = this.handleThermostatModeCool.bind(this);
    this.handleThermostatModeOff = this.handleThermostatModeOff.bind(this);
    this.handleThermostatModeAuto = this.handleThermostatModeAuto.bind(this);
    this.handleTemperatureChange = this.handleTemperatureChange.bind(this);
    this.handleTemperatureIncrement = this.handleTemperatureIncrement.bind(
      this
    );
    this.handleThermostaChange = this.handleThermostaChange.bind(this);
  }

  componentDidMount() {
    this.setState({ loading: true });

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "React POST Request Example" })
    };

    if (
      localStorage.uidHash === "undefined" ||
      localStorage.uidHash === "null"
    ) {
      fetch(
        "https://api-staging.paritygo.com/sensors/api/thermostat/register/",
        requestOptions
      )
        .then(response => response.json())
        .then(data =>
          this.setState({
            uidHash: data.uid_hash,
            thermostatMode: data.state
          })
        );
    } else {
      console.log("ALREADY SET!");
      console.log(localStorage.uidHash);
      fetch(
        "https://api-staging.paritygo.com/sensors/api/thermostat/" +
          localStorage.uidHash
      )
        .then(response => response.json())
        .then(data =>
          this.setState({
            thermostatMode: data.state
          })
        );
    }

    // Get the current date + 2hrs previous in order to get the current range of data points when fetching the data.
    let currentDate = new Date();
    let currentYear = currentDate.getFullYear();
    let currentMonth = currentDate.getMonth() + 1;
    let currentDay = currentDate.getDate();
    let currentHours = currentDate.getHours();
    let currentMinutes = currentDate.getMinutes();

    let previousDate = new Date();
    previousDate.setHours(previousDate.getHours() - 2);
    let currentYearB = previousDate.getFullYear();
    let currentMonthB = previousDate.getMonth() + 1;
    let currentDayB = previousDate.getDate();
    let currentHoursB = previousDate.getHours();
    let currentMinutesB = previousDate.getMinutes();

    const endingTime =
      currentYear +
      "-" +
      currentMonth +
      "-" +
      currentDay +
      "T" +
      currentHours +
      ":" +
      currentMinutes;
    const beginTime =
      currentYearB +
      "-" +
      currentMonthB +
      "-" +
      currentDayB +
      "T" +
      currentHoursB +
      ":" +
      currentMinutesB;

    let today = currentMonth + "-" + currentDay + "-" + currentYear;
    this.setState({ todayDate: today });

    // Time
    let date = new Date();
    let hours = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
    let am_pm = date.getHours() >= 12 ? "PM" : "AM";
    hours = hours < 10 ? "0" + hours : hours;
    let minutes =
      date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
    let time = hours + ":" + minutes + " " + am_pm;
    this.setState({ currentTime: time });

    // Get Indoor data
    fetch(
      "https://api-staging.paritygo.com/sensors/api/sensors/indoor-1/?begin=" +
        beginTime +
        "&end=" +
        endingTime
    )
      .then(response => response.json())
      .then(data => {
        this.setState({
          loading: false,
          indoorData: data
        });
        // make sure there are 2 other data points in 10 or 15 mins?
        // first get everything functioning, then you can iterate and make great improvements
        const real_data = this.state.indoorData.data_points;
        const mostRecentData = real_data.length - 1;
        const secondMostRecentData = real_data.length - 2;
        const thirdMostRecentData = real_data.length - 3;

        const last5Mins = parseInt(real_data[mostRecentData].value, 10);
        const last10Mins = parseInt(real_data[secondMostRecentData].value, 10);
        const last15Mins = parseInt(real_data[thirdMostRecentData].value, 10);
        const averageIndoorTemp = (last5Mins + last10Mins + last15Mins) / 3;
        const averageIndoorTempRounded = averageIndoorTemp.toFixed(0);
        this.setState({
          averageIndoorTempRounded: averageIndoorTempRounded
        });
      });

    // Get humidity data
    fetch(
      "https://api-staging.paritygo.com/sensors/api/sensors/humidity/?begin=" +
        beginTime +
        "&end=" +
        endingTime
    )
      .then(response => response.json())
      .then(data => {
        this.setState({
          loading: false,
          humidityData: data
        });

        const real_data = this.state.humidityData.data_points;
        const mostRecentData = real_data.length - 1;
        const recentHumidity = parseInt(real_data[mostRecentData].value, 10);

        this.setState({
          humidity: recentHumidity
        });
      });

    // Get outdoor data
    fetch(
      "https://api-staging.paritygo.com/sensors/api/sensors/outdoor-1/?begin=" +
        beginTime +
        "&end=" +
        endingTime
    )
      .then(response => response.json())
      .then(data => {
        this.setState({
          loading: false,
          outdoorData: data
        });

        const real_data = this.state.outdoorData.data_points;
        const mostRecentData = real_data.length - 1;
        const secondMostRecentData = real_data.length - 2;
        const thirdMostRecentData = real_data.length - 3;

        const last5Mins = parseInt(real_data[mostRecentData].value, 10);
        const last10Mins = parseInt(real_data[secondMostRecentData].value, 10);
        const last15Mins = parseInt(real_data[thirdMostRecentData].value, 10);
        const averageOutdoorTemp = (last5Mins + last10Mins + last15Mins) / 3;
        const averageOutdoorTempRounded = averageOutdoorTemp.toFixed(0);
        this.setState({
          averageOutdoorTempRounded: averageOutdoorTempRounded
        });
      });
  }

  handleThermostatModeHeat() {
    // Patch request
    fetch(
      "https://api-staging.paritygo.com/sensors/api/thermostat/" +
        this.state.uidHash +
        "/",
      {
        headers: { "Content-Type": "application/json; charset=utf-8" },
        method: "PATCH",
        body: JSON.stringify({
          state: "heat"
        })
      }
    );
    this.setState({ thermostatMode: "heat" });
  }

  handleThermostatModeAuto() {
    // Patch request
    fetch(
      "https://api-staging.paritygo.com/sensors/api/thermostat/" +
        this.state.uidHash +
        "/",
      {
        headers: { "Content-Type": "application/json; charset=utf-8" },
        method: "PATCH",
        body: JSON.stringify({
          state: "auto_standby"
        })
      }
    );
    this.setState({ thermostatMode: "auto_standby" });
  }

  handleThermostatModeOff() {
    // Patch requests
    fetch(
      "https://api-staging.paritygo.com/sensors/api/thermostat/" +
        this.state.uidHash +
        "/",
      {
        headers: { "Content-Type": "application/json; charset=utf-8" },
        method: "PATCH",
        body: JSON.stringify({
          state: "off"
        })
      }
    );
    this.setState({ thermostatMode: "off" });
  }

  handleThermostatModeCool() {
    // Patch request
    if (this.state.averageOutdoorTempRounded < 0) {
      alert("Temperature is too low for that");
    } else {
      fetch(
        "https://api-staging.paritygo.com/sensors/api/thermostat/" +
          this.state.uidHash +
          "/",
        {
          headers: { "Content-Type": "application/json; charset=utf-8" },
          method: "PATCH",
          body: JSON.stringify({
            state: "cool"
          })
        }
      );
      this.setState({ thermostatMode: "cool" });
    }
  }

  handleTemperatureChange(event) {
    this.setState({ desiredTemperature: event.target.value });
    localStorage.setItem("desiredTemperature", event.target.value);

    if (
      this.state.desiredTemperature < this.state.averageIndoorTempRounded &&
      this.state.averageOutdoorTempRounded > 0
    ) {
      this.setState({ thermostatMode: "auto_cool" });
      fetch(
        "https://api-staging.paritygo.com/sensors/api/thermostat/" +
          this.state.uidHash +
          "/",
        {
          headers: { "Content-Type": "application/json; charset=utf-8" },
          method: "PATCH",
          body: JSON.stringify({
            state: "auto_cool"
          })
        }
      );
    } else if (
      this.state.desiredTemperature < this.state.averageIndoorTempRounded
    ) {
      this.handleThermostatModeAuto();
    } else {
      this.setState({ thermostatMode: "auto_heat" });

      fetch(
        "https://api-staging.paritygo.com/sensors/api/thermostat/" +
          this.state.uidHash +
          "/",
        {
          headers: { "Content-Type": "application/json; charset=utf-8" },
          method: "PATCH",
          body: JSON.stringify({
            state: "auto_heat"
          })
        }
      );
    }
  }

  handleTemperatureIncrement(direction) {
    console.log("Temperature up 1");
    console.log(this.state.averageIndoorTempRounded);
    let currentDesiredTemp = parseInt(this.state.desiredTemperature, 10);
    if (isNaN(currentDesiredTemp)) {
      currentDesiredTemp = parseInt(this.state.averageIndoorTempRounded, 10);
    }
    if (direction === "increase") {
      currentDesiredTemp = currentDesiredTemp + 1;
    } else {
      currentDesiredTemp = currentDesiredTemp - 1;
    }

    localStorage.setItem("desiredTemperature", currentDesiredTemp);
    this.setState({ desiredTemperature: currentDesiredTemp });
  }

  handleThermostaChange(mode) {
    console.log(mode);
  }

  render() {
    localStorage.setItem("uidHash", this.state.uidHash);

    if (
      localStorage.desiredTemperature === "undefined" ||
      localStorage.desiredTemperature === "null"
    ) {
      localStorage.setItem(
        "desiredTemperature",
        this.state.averageIndoorTempRounded
      );
    } else {
      // console.log("Desired temp already set");
    }

    // delete localStorage.uidHash;
    // console.log("localstorage value after render: " + localStorage.uidHash);

    return (
      <div className="thermostatContainer">
        <ul className="desiredTemperature">
          <li className="outside-temp">
            <h2 className="dateTime">{this.state.todayDate}</h2>
            <h2 className="time-section">{this.state.currentTime}</h2>
            <h2 className="section-header">Outdoor</h2>
            <h2 className="humidity-holder">
              {this.state.averageOutdoorTempRounded}&#176; /{" "}
              {this.state.humidity}&#37; Humidity
            </h2>
            <h2 className="section-header">Status</h2>
            <h2 className="thermostat-mode">{this.state.thermostatMode}</h2>
          </li>
          <li className="inside-temp">
            <h2 className="section-header">Indoor</h2>
            <span>{this.state.averageIndoorTempRounded}&#176;</span>
            <input
              id="typeinp"
              type="range"
              min="10"
              max="40"
              value={this.state.desiredTemperature}
              onChange={this.handleTemperatureChange}
              step="1"
            />
          </li>
          <li className="set-temp-box">
            <button
              value={this.state.desiredTemperature}
              onClick={() => this.handleTemperatureIncrement("increase")}
            >
              <span className="fas fa-angle-up" />
            </button>
            <span className="set-to"> Set to </span>
            <span className="set-to-temp">
              {this.state.desiredTemperature}&#176;
            </span>
            <button
              value={this.state.desiredTemperature}
              onClick={() => this.handleTemperatureIncrement("down")}
            >
              <span className="fas fa-angle-down" />
            </button>
          </li>
        </ul>

        <div className="thermostat-container">
          <div className="active-thermostat-mode" />
          <button onClick={() => this.handleThermostaChange("Cool")}>
            <span>Cool</span>
          </button>
          <button onClick={() => this.handleThermostaChange("Off")}>
            <span>Off</span>
          </button>
          <button onClick={() => this.handleThermostaChange("Heat")}>
            <span>Heat</span>
          </button>
        </div>

        <div className="control-buttons">
          <div className="temperature-buttons-container">
            <button onClick={this.handleThermostatModeHeat}>Heating</button>
            <button onClick={this.handleThermostatModeOff}>Off</button>
            <button onClick={this.handleThermostatModeCool}>Cooling</button>
          </div>
          <div className="fan-buttons-container">
            <button onClick={this.handleThermostatModeAuto}>On</button>
            <button onClick={this.handleThermostatModeAuto}>Auto</button>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
