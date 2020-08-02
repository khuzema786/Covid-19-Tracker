import React, { useState, useEffect } from "react";
import { MenuItem, FormControl, Select } from "@material-ui/core";
import { Card, CardContent } from "@material-ui/core";
import InfoBox from "./Components/infoBox";
import Map from "./Components/Map";
import Table from "./Components/Table";
import LineGraph from "./Components/LineGraph";
import { sortData, prettyPrintStat } from "./util";
import "./App.css";
import "leaflet/dist/leaflet.css";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData, setTableData] = useState([]);
  const [mapCenter, setMapCenter] = useState({
    lat: [34.80746],
    lng: [-40.4796],
  });
  const [zoom, setZoom] = useState(3);
  const [mapCountries, setMapCountries] = useState([]);
  const [casesType, setCasesType] = useState("cases");

  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then((response) => response.json())
      .then((data) => {
        setCountryInfo(data);
      });
  }, []);

  useEffect(() => {
    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
        .then((response) => response.json())
        .then((data) => {
          // map function helps return an array of object in contrast to forEach
          const countries = data.map((country) => ({
            name: country.country, // United States, India ...
            value: country.countryInfo.iso2, // UK, US, FR, IN ...
          }));

          const sortedData = sortData(data);
          setTableData(sortedData);
          setMapCountries(data);
          setCountries(countries);
        });
    };

    getCountriesData();
  }, []);

  const onCountryChange = async (event) => {
    const countryCode = event.target.value;
    setCountry(countryCode); // country of select would map to country.value of MenuItem

    const url =
      countryCode === "worldwide"
        ? fetch("https://disease.sh/v3/covid-19/all")
            .then((response) => response.json())
            .then((data) => {
              setCountryInfo(data);
              setMapCenter([34.80746, -40.4796]);
              setZoom(3);
            })
        : await fetch(`https://disease.sh/v3/covid-19/countries/${countryCode}`)
            .then((response) => response.json())
            .then((data) => {
              setCountry(countryCode);
              setCountryInfo(data);
              setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
              setZoom(4);
            });
  };

  console.log("COUNTRY INFO >>>", countryInfo);

  return (
    <div className={`App ${darkMode && "Dark"}`}>
      <div className="app__left">
        <div className="app__header">
          <h1>COVID-19 TRACKER</h1>
          <div className="app__headerRight">
            <input
              type="checkbox"
              id="time"
              onClick={() => setDarkMode(!darkMode)}
            />
            <label htmlFor="time">Night</label>
            <div className="app__headerRightSpace" />
            <FormControl className="app__dropdown">
              <Select
                style={darkMode ? { color: "white" } : {}}
                variant="outlined"
                onChange={onCountryChange}
                value={country}
              >
                <MenuItem value="worldwide">Worldwide</MenuItem>
                {countries.map((country) => (
                  <MenuItem key={country.name} value={country.value}>
                    {country.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </div>
        <div className="app__stats">
          <InfoBox
            darkMode={darkMode}
            onClick={(e) => setCasesType("cases")}
            title="Coronavirus Cases"
            isRed
            active={casesType === "cases"}
            cases={prettyPrintStat(countryInfo.todayCases)}
            total={prettyPrintStat(countryInfo.cases)}
          />
          <InfoBox
            darkMode={darkMode}
            onClick={(e) => setCasesType("recovered")}
            title="Recovered"
            active={casesType === "recovered"}
            cases={prettyPrintStat(countryInfo.todayRecovered)}
            total={prettyPrintStat(countryInfo.recovered)}
          />
          <InfoBox
            darkMode={darkMode}
            onClick={(e) => setCasesType("deaths")}
            title="Deaths"
            isRed
            active={casesType === "deaths"}
            cases={prettyPrintStat(countryInfo.todayDeaths)}
            total={prettyPrintStat(countryInfo.deaths)}
          />
        </div>
        <Map
          darkMode={darkMode}
          casesType={casesType}
          countries={mapCountries}
          center={mapCenter}
          zoom={zoom}
        />
      </div>
      <Card className="app__right">
        <CardContent>
          <div className="app__rightTop">
            <h3>Live Cases By Country</h3>
            <Table darkMode={darkMode} countries={tableData} />
          </div>
          <div className="app__rightBottom">
            <h3>
              Worldwide New{" "}
              {casesType.charAt(0).toUpperCase() + casesType.slice(1)}
            </h3>
            <LineGraph darkMode={darkMode} casesType={casesType} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
