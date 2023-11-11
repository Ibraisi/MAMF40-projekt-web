import "./App.css";
import fakeData from "./mock_data.json";
import React, { useState } from "react";
//import { useTable, useGroupBy } from "react-table";


//Funktion för hämtning av månad från "expiration_date"
function getMonthFromDate(dateString) {
  const date = new Date(dateString);
  const month = date.getMonth() + 1; //Returnerar ett heltal som representerar utgångsdatumets månad
  return month;
}
//Hämtar namnet på månaden baserat på siffran från getMonthFromDate, kontrollerar om siffran är giltig
function getMonthNameFromNumber(monthNumber) {
  const months = [
    "Januari",
    "Februari",
    "Mars",
    "April",
    "Maj",
    "Juni",
    "Juli",
    "Augusti",
    "September",
    "Oktober",
    "November",
    "December",
  ];
  if (monthNumber >= 1 && monthNumber <= 12) {
    return months[monthNumber - 1]; 
  } else {
    return "Invalid Month";
  }
}
// Sorteringsalgoritm för dynamisk hantering och visning av månadsavsnitt i diagrammet 
function sortByMonth(data) {
  return data.sort(
    (a, b) =>
      getMonthFromDate(a.expiration_date) - getMonthFromDate(b.expiration_date)
  );
}

function App() {
  console.log(fakeData);
  const data = React.useMemo(() => fakeData, []);
  //Dataset från JSON
  const columns = React.useMemo(
    () => [
      {
        Header: "ID",
        accessor: "id",
      },
      {
        Header: "Namn på läkemedel",
        accessor: "name",
      },
      {
        Header: "Utgångsdatum",
        accessor: "expiration_date",
      },
      {
        Header: "LOT-nummer",
        accessor: "lot_nbr",
      },
      {
        Header: "Produktkod",
        accessor: "product_code",
      },
      {
        Header: "Serienummer",
        accessor: "serial_number",
      },
    ],
    []
  );

  //const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
   //useTable({ columns, data }, useGroupBy);

  const dataWithMonth = React.useMemo(() => {
    const rawData = fakeData.map((row) => ({
      ...row,
      month: getMonthFromDate(row.expiration_date),
    }));
    return sortByMonth(rawData);
  }, []);

  // Gruppera alla rader i månads-avsnitt
  const groupedData = dataWithMonth.reduce((acc, row) => {
    const month = row.month;
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(row);
    return acc;
  }, {});

  const groupedRows = Object.entries(groupedData).map(([month, rows]) => ({
    month,
    rows,
  }));

  const [searchTerm, setSearchTerm] = useState('');
  const [avdelning, setAvdelning] = useState('');

  const [manName, setManName] = useState('');
  const [manDate, setManDate] = useState('');
  const [manLot, setManLot] = useState('');
  const [manAvdelning, setManAvdelning] = useState('');
  
  const [added, setAdded] = useState('');

  const options = [ //Avdelnings drop down meny
    {label: "Alla Avdelningar", value: "all"},
    {label: "hjärt och lung", value: "heart"},
    {label: "Akut", value: "akut"},
    {label: "Barn och Ungdom", value: "barn"},
  ]



  function handleSelect(event){ //Sätter in värdet i avdelning från vald i drop down
    setAvdelning(event.target.value);
    setAdded("");
  }

  function manHandleSelect(event){ //Sätter in värdet i manAvdelning från vald i drop down för manuell tilläggning
    setManAvdelning(event.target.value);
    setAdded("");
  }

  function addManually(){ //Skicka manName, manDate, manLot, manAvdelning till databas
    setAdded("Tilläggning lyckades");

  /*
    sendToDatabase(manName, manDate, manLot, manAvdelning);
  */

  }

  // Render the table
  return (
    <div className="App" >
      {/*<h1>{avdelning}</h1> test av dropdown*/}
      {/*<h1>{manName}</h1> {/*test av sökfält*/}
      {/*<h1>{manDate}</h1> {/*test av sökfält*/}
      {/*<h1>{manLot}</h1> {/*test av sökfält*/}
      {/*<h1>{manAvdelning}</h1> {/*test av sökfält*/}
      <div className="search-bar">{/* Div till val av avdelning och sökning av produkt */}
      
        <div className="left-search">
          <select className="avdelning" onChange={handleSelect}> {/* Dropdown meny */}
            {options.map(option => (
              <option value={option.value}>{option.label}</option>
              ))}
          </select>
        </div>
        <div className="right-search">
          <div>
            <input
                placeholder="Sök efter Batch/Läkemedelsnamn"
                onChange={(e) => {setSearchTerm(e.target.value); setAdded("")}}
              />
          </div>
        </div>
      </div>


      <div className="center-table">
        <div
          style={{
            width: "75%",
            height: "65vh",
            overflowY: "auto",
            border: "1px solid #000",
          }}
        >
          <table
            style={{
              width: "100%",
            }}
          >
            <thead>{/* OM MAN VILL LÄGGA NÅGOT I TABLE HEAD SENARE */}</thead>
            <tbody>
              {groupedRows.map(({ month, rows }) => (
                <React.Fragment key={month}>
                  <tr
                    style={{
                      border: "1px solid #000",
                      textAlign: "left",
                      height: "40px",
                      background: "#87CEEB",
                    }}
                  >
                    <td className="bold-cell" colSpan="10">
                      {getMonthNameFromNumber(month)}
                    </td>
                  </tr>
                  <tr
                    style={{
                      border: "1px solid #000",
                    }}
                  >
                    <th>ID</th>
                    <th>Namn på läkemedel</th>
                    <th>Utgångsdatum</th>
                    <th>LOT-nummer</th>
                    <th>Produktkod</th>
                    <th>Serienummer</th>
                  </tr>
                  {rows.map((row) => (
                    <tr
                      key={row.id}
                      style={{
                        border: "0.5px solid grey"
                      }}
                    >
                      <td>{row.id}</td>
                      <td>{row.name}</td>
                      <td>{row.expiration_date}</td>
                      <td>{row.lot_nbr}</td>
                      <td>{row.product_code}</td>
                      <td>{row.serial_number}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="manual-box"> {/* Div till Manuell input av läkemedel */}
        <div><p>Lägg Till Manuellt</p></div>

        <div className="manual-input">
          <input
            placeholder="Läkemedelsnamn"
            onChange={(e) => {setManName(e.target.value); setAdded("")}}              
          />
          <input
            placeholder="ÅÅÅÅ/MM/DD"
            onChange={(e) => {setManDate(e.target.value); setAdded("")}}
          />
          <input
            placeholder="Batch nr"
            onChange={(e) => {setManLot(e.target.value); setAdded("")}}
          />
          <select className="avdelning" onChange={manHandleSelect}> {/* Dropdown meny */}
              {options.map(option => (
                <option value={option.value}>{option.label}</option>
                ))}
            </select>
          <button
            onClick={() => addManually()}
          >
          Lägg Till 
          </button>
          <p>{added}</p>
        </div>
      </div>
    </div>
  );
}
export default App;