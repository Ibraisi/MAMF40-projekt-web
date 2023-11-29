import "./App.css";
import fakeData from "./mock_data.json";
import React, { useState } from "react";
import Popup from './components/popup';
//import { useTable, useGroupBy } from "react-table";
import { validateSection, getMedData, parseItemData, submitScannedItem, deleteItem } from './handles/firebaseHandler';
 


//Funktion för hämtning av månad från "expiry"
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
      getMonthFromDate(a.expiry) - getMonthFromDate(b.expiry) //SORT SKA SKE EFTER LOT-NUMMER
  );
}
const currentDate = new Date();

function expireSoon(insertedDate){
  const inputDate = new Date(insertedDate);

  const timeDifference = inputDate.getTime() - currentDate.getTime();

  const oneWeekInMilliseconds = 7 * 24 * 60 * 60 * 1000; 

  return timeDifference >= 0 && timeDifference <= oneWeekInMilliseconds;
}

function expired(insertedDate){
  const inputDate = new Date(insertedDate);

  const timeDifference = inputDate.getTime() - currentDate.getTime();

  return timeDifference <= 0;
}

function daysUntilExpires(insertedDate){
  const inputDate = new Date(insertedDate);

  const timeDifference = inputDate.getTime() - currentDate.getTime();

  const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

  return daysDifference;
}

function App() {

  const [isHovered, setIsHovered] = useState(false);

  const handleHover = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };
  

  const [added, setAdded] = useState('');
  const [removed, setRemoved] = useState('');

  const [avdelning, setAvdelning] = useState('');

  const[buttonPopup, setButtonPopup] = useState(false);
  const[removeButtonPopup, setRemoveButtonPopup] = useState(false);

  const [manName, setManName] = useState('');
  const [manDate, setManDate] = useState('');
  const [manLot, setManLot] = useState('');
  const [manAvdelning, setManAvdelning] = useState('');

  const [removeGtin, setRemoveGtin] = useState('');
  const [removeExpiry, setRemoveExpiry] = useState('');
  const [removeLot, setRemoveLot] = useState('');

  const [medDataArray, setMedDataArray] = useState([]);
  console.log(fakeData);

  React.useEffect(() => {
    (async () => {
      const medData = await getMedData();
      setMedDataArray(medData);
    })();
  }, [added, removed])

  // const fs = require('fs');

  // fs.writeFile('src/data.json', JSON.stringify(JSON.stringify(medDataArray)), (err) => {
  //       if (err) {
  //         console.error('Error writing to JSON file:', err);
  //       } else {
  //         console.log('Data written to JSON file successfully.');
  //       }
  //   });

  //const data = React.useMemo(() => JSON.stringify(medDataArray), []);
  //Dataset från JSON
  const [searchTerm, setSearchTerm] = useState('');
  const isSearchTermEmpty = searchTerm.trim() === '';

  console.log(fakeData);
  getMedData();
  // const data = React.useMemo(() => fakeData, []);
  //Dataset från JSON
  // const columns = React.useMemo(
  //   () => [
  //     {
  //       Header: "ID",
  //       accessor: "section",
  //     },
  //     {
  //       Header: "Namn på läkemedel",
  //       accessor: "gtin",
  //     },
  //     {
  //       Header: "Utgångsdatum",
  //       accessor: "expiry",
  //     },
  //     {
  //       Header: "LOT-nummer",
  //       accessor: "lot",
  //     },
  //     {
  //       Header: "Serienummer",
  //       accessor: "serial",
  //     },
  //   ],
  //   []
  // );

  //const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
   //useTable({ columns, data }, useGroupBy);



//--------------------- VAL AV AVDELNING --------------------------- 
const options = [ //Avdelnings drop down meny
{label: "Alla Avdelningar", value: "N/A"},
{label: "Hjärt och lung", value: "heart"},
{label: "Akut", value: "akut"},
{label: "Barn och Ungdom", value: "barn"},
]

const optionsAdd = [ //Avdelnings drop down meny
{label: "Hjärt och lung", value: "heart"},
{label: "Akut", value: "akut"},
{label: "Barn och Ungdom", value: "barn"},
]

const isComputer = window.innerWidth >= 500; //kollar om det är dator, 

function handleSelect(event){ //Sätter in värdet i avdelning från vald i drop down
setAvdelning(event.target.value);
setAdded("");
}

const isSectionSelected = avdelning.trim() === 'N/A';
//--------------------- ENDOF VAL AV AVDELNING --------------------------------- 

//--------------------- UPPDELNING AV DATA I SEGMENT + SÖKNING --------------------------- 
  const dataWithMonth = React.useMemo(() => {
    console.log('medDataArray: ', medDataArray);
    const rawData = medDataArray.map((row) => ({
      ...row,
      month: getMonthFromDate(row.expiry),
    }));
    //Checka om det finns searchTerm, if(searchterm hittas i antingingen namn eller batch-rader), om inget hittas, skriv ut allt
    return sortByMonth(rawData);
  }, [medDataArray]);

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

 



// Filtrera raderna baserat på avdelning (section)
const sectionFilteredRows = dataWithMonth.filter((row) => 
  row.section.toLowerCase().includes(avdelning.trim().toLowerCase())
);

// Filtrera de section-filtrerade raderna baserat på sökterm
const filteredRows = sectionFilteredRows.filter((row) =>
  (
    row.expiry.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
    row.gtin.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
    row.lot.toLowerCase().includes(searchTerm.trim().toLowerCase())
  )
);

// Gruppen omstruktureras med filtrerade rader
const filteredGroupedData = filteredRows.reduce((acc, row) => {
const month = row.month;
if (!acc[month]) {
  acc[month] = [];
}
acc[month].push(row);
return acc;
}, {});

const filteredGroupedRows = Object.entries(filteredGroupedData).map(
([month, rows]) => ({
  month,
  rows,
})
);
const filterChoice = isSectionSelected ? groupedRows : filteredGroupedRows;
  //Datan ovanför söks igenom  i sökfunktion

//--------------------- ENDOF UPPDELNING AV DATA I SEGMENT + SÖKNING --------------------------- 

  function manHandleSelect(event){ //Sätter in värdet i manAvdelning från vald i drop down för manuell tilläggning
    setManAvdelning(event.target.value);
    setAdded("");
  }

  function addManually(){ //Skicka manName, manDate, manLot, manAvdelning till databas
    console.log('add manually');
    setButtonPopup(true);
    console.log(buttonPopup);
  }
  
  function submitManually(){
    setAdded("Tilläggning lyckades");
    submitScannedItem(manName, manDate, manLot, manAvdelning);
  }
  function removeManually(){
    setRemoveButtonPopup(true);
  }
  function confirmRemoveManually(){
    setRemoved("Borttagning lyckades");
    deleteItem(removeGtin, removeExpiry, removeLot);
    
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
          <select className="searchBox" style={{width:"40%"}} onChange={handleSelect}> {/* Dropdown meny */}
            {options.map(option => (
              <option value={option.value}>{option.label}</option>
              ))}
          </select>
        </div>
        <div className="title-div">
          <p className="title-name">Med-skAPP</p>
        </div>
        <div className="right-search">
          <div className="right-search">
            <input 
                className="searchBox"
                placeholder="Sök efter Batch/Läkemedelsnamn"
                onChange={(e) => {setSearchTerm(e.target.value); setAdded("")}} //Innuti klamrar , skapa funktion som hämtar sökt objekt från JSON-fil
              />
          </div>
        </div>
      </div>

      <div className="center-table">
        <div className="table-outer-div">
          <div className="table-div">
            <table
              style={{
                width: "100%",
              }}
            >
              <thead>{/* OM MAN VILL LÄGGA NÅGOT I TABLE HEAD SENARE */}</thead>
              <tbody>

                {/*Om sökfönster är tomt, renderea som vanligt, annars rendererar man bara de sökninens träffar
                 baserat på läkemedelsnamn eller LOT-nummer. filterChoice sätts beroende på sökrutans inehåll*/}
                {(filterChoice.map(({ month, rows }) => (
                  <React.Fragment key={month}>
                    <tr
                      style={{
                        border: "1px solid #000",
                        textAlign: "left",
                        height: "40px",
                        background: "#d2d2d2",
                        fontSize: "20px"
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
                      <th>Status</th>
                      <th>Namn på läkemedel</th>
                      <th>Utgångsdatum</th>
                      <th>LOT-nummer</th>
                      {/*<th>Produktkod</th>*/}
                      {/*<th>Serienummer</th>*/}
                    </tr>
                    {rows.map((row) => (
                     <tr
                     style={{
                       border: "0.5px solid grey",
                       background: 
                        expireSoon(row.expiry) ? "Orange" 
                        :expired(row.expiry )? "#ea6e6e" 
                        :"#fff",
                     }}
                   >
                        <td>
                        {expireSoon(row.expiry) ? (
                          <div 
                              className={`custom-tooltip ${isHovered ? 'show' : ''}`}
                              onMouseEnter={handleHover}
                              onMouseLeave={handleMouseLeave}>
                              !
                              {isHovered && <div className="expiring-tooltip-content">Går ut om {daysUntilExpires(row.expiry)} dagar</div>}
                           </div>
                          ):expired(row.expiry) ? (
                            <div 
                            className={`custom-tooltip ${isHovered ? 'show' : ''}`}
                            onMouseEnter={handleHover}
                            onMouseLeave={handleMouseLeave}>
                            !
                            {isHovered && <div className="expired-tooltip-content">Utgången</div>}
                            </div>
                          ):(<div></div>)}
                        </td>
                        <td>{row.gtin}</td>
                        <td>{row.expiry}</td>
                        <td>{row.lot}</td>
                        <td> 
                           <button
                              className="button-remove"
                              onClick={() => {removeManually(); setRemoveGtin(row.gtin); setRemoveExpiry(row.expiry); setRemoveLot(row.lot);}}            
                            >
                              X
                            </button>
                          </td>
                        {/*<td>{row.product_code}</td>*/}
                        {/*<td>{row.serial_number}</td>*/}
                      </tr>
                    ))}
                  </React.Fragment>
                )))} 
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isComputer ?
        <div className="manual-box"> {/* Div till Manuell input av läkemedel */}
          <div style={{height: "40px", width: "100%"}}><p className="textAdd">Lägg Till Manuellt</p></div>

          <div className="manual-input-div">
            <input
              className="manual-input"
              placeholder="Läkemedelsnamn"
              onChange={(e) => {setManName(e.target.value); setAdded(""); setRemoved("")}}              
            />
            <input
              className="manual-input"
              placeholder="Utgångsdatum(ÅÅÅÅ-MM-DD)"
              onChange={(e) => {setManDate(e.target.value); setAdded("")}}
            />
            <input
              className="manual-input"
              placeholder="Batch-nr"
              onChange={(e) => {setManLot(e.target.value); setAdded("")}}
            />
            <select className="manual-input" onChange={manHandleSelect}> {/* Dropdown meny */}
                {optionsAdd.map(option => (
                  <option value={option.value}>{option.label}</option>
                  ))}
              </select>
            <button className="button-add"
              onClick={() => addManually()}
            >Lägg Till</button>
            <p style={{height: "20px",}}>{added}</p>
          </div>
        </div>
      : [] }  

      <Popup trigger={buttonPopup} setTrigger={setButtonPopup} setManually={submitManually} confirmButtonText="Lägg till">
        <h3>Lägg till:</h3>
        <p>Läkemedelsnamn: {manName}</p>
        <p>Utgångsdatum: {manDate}</p>
        <p>Batch-nr: {manLot}</p>
        <p>Avdelning: {manAvdelning}</p>
      </Popup>
      
      <Popup trigger={removeButtonPopup} setTrigger={setRemoveButtonPopup} setManually={confirmRemoveManually} confirmButtonText="Ta bort">
        <h3>Ta bort:</h3>
        <p> Läkemedelsnamn: {removeGtin}</p>
        <p> Utgångsdatum: {removeExpiry}</p>
        <p> Batch-nr: {removeLot}</p>
      </Popup>
    </div>
  );
}
export default App;