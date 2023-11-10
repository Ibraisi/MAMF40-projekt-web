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

  // Render the table
  return (
    <div className="App" >
      <div className="center-table">
        <div
          style={{
            width: "75%",
            height: "600px",
            overflowY: "auto",
          }}
        >
          <table
            style={{
              borderCollapse: "collapse",
              border: "2px solid #000",
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
    </div>
  );
}
export default App;
