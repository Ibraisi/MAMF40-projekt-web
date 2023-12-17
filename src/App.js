import "./App.css";
import React, { useState } from "react";
import Popup from './components/popup';
//import { useTable, useGroupBy } from "react-table";
import { getMedData, submitScannedItem, deleteItem } from './handles/firebaseHandler';
 

//Funktion för hämtning av månad från "expiry"
function getMonthFromDate(dateString) {
  const date = new Date(dateString);
  const month = date.getMonth() + 1; //Returnerar ett heltal som representerar utgångsdatumets månad
  return month;
}

//Funktion för hämtning av år från "expiry"
function getYearFromDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  return year
}

//Hämtar namnet på månaden baserat på siffran från getMonthFromDate, kontrollerar om siffran är giltig
function getMonthNameFromNumber(monthNumber) {
  const monthNames = [
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
    return monthNames[monthNumber - 1]; 
  } else {
    return "Invalid Month";
  }
}
// Sorteringsalgoritm för dynamisk hantering och visning av månadsavsnitt i diagrammet 
function sortByMonth(data) {
  return data.sort(
    (a, b) =>
      getMonthFromDate(a.expiry) - getMonthFromDate(b.expiry)
  );
}



function App() {


  //statusvariabler 
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [removed, setRemoved] = useState('');
  const [avdelning, setAvdelning] = useState('');
  const [removeGtin, setRemoveGtin] = useState('');
  const [removeExpiry, setRemoveExpiry] = useState('');
  const [removeLot, setRemoveLot] = useState('');
  const [removeSection, setRemoveSection] = useState('');

  const [manName, setManName] = useState('');
  const [manDate, setManDate] = useState('');
  const [manLot, setManLot] = useState('');
  const [manAvdelning, setManAvdelning] = useState('Hjärt och Lung');

  const[buttonPopup, setButtonPopup] = useState(false);
  const[removeButtonPopup, setRemoveButtonPopup] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [Checked, setChecked] = useState(true);
  const [medDataArray, setMedDataArray] = useState([]);
  
  const isSectionSelected = avdelning.trim() === 'all';

  //Hämta medicindata när message eller removed ändras
  React.useEffect(() => {
    (async () => {
      const medData = await getMedData();
      setMedDataArray(medData);
      console.log('rendered');
    })();
  }, [message, removed])

  //sortera läkemedelsdata baserat på expiry
  const sortedMedDataArray = [...medDataArray].sort((a, b) => {
    const expiryA = a.expiry.toLowerCase();
    const expiryB = b.expiry.toLowerCase();
  
    if (expiryA < expiryB) {
      return -1;
    }
    if (expiryA > expiryB) {
      return 1;
    }
    return 0;
  });

   const handleHover = () => {
     setIsHovered(true);
   };
 
   const handleMouseLeave = () => {
     setIsHovered(false);
   };
   

const isComputer = window.innerWidth >= 500; //kollar om det är dator, 

const currentDate = new Date();
//--------------------- UPPDELNING AV DATA I SEGMENT + SÖKNING --------------------------- 
const dataWithMonthAndYear = React.useMemo(() => {
  const rawData = sortedMedDataArray.map((row) => ({
    ...row,
    month: getMonthFromDate(row.expiry),
    year: getYearFromDate(row.expiry),
  }));
  // Check if there is searchTerm, if (searchTerm is found in either name or batch rows), if nothing is found, display everything
  return sortByMonth(rawData);
}, [sortedMedDataArray]);


// Gruppera alla rader i månads-avsnitt
const groupedData = dataWithMonthAndYear.reduce((acc, row) => {
  const { year, month } = row; // Destructure year and month properties
  const key = `${year}-${month}`;
  if (!acc[key]) {
    acc[key] = [];
  }
  acc[key].push(row);
  return acc;
}, {});

const groupedRows = Object.entries(groupedData).map(([key, rows]) => {
  const [year, month] = key.split('-').map(Number); // Split the key and convert to numbers
  return {
    year,
    month,
    rows,
  };
});

// Filtrera raderna baserat på avdelning (section)
const sectionFilteredRows = dataWithMonthAndYear.filter((row) =>
  row.section.toLowerCase().includes(avdelning.trim().toLowerCase())
);

// Filtrera de section-filtrerade raderna baserat på sökterm
const filteredRows = sectionFilteredRows.filter((row) =>
  row.expiry.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
  row.gtin.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
  row.lot.toLowerCase().includes(searchTerm.trim().toLowerCase())
);

// Gruppen omstruktureras med filtrerade rader
const filteredGroupedData = filteredRows.reduce((acc, row) => {
  const { year, month } = row; // Destructure year and month properties
  const key = `${year}-${month}`;
  if (!acc[key]) {
    acc[key] = [];
  }
  acc[key].push(row);
  return acc;
}, {});

const filteredGroupedRows = Object.entries(filteredGroupedData).map(([key, rows]) => {
  const [year, month] = key.split('-').map(Number); // Split the key and convert to numbers
  return {
    year,
    month,
    rows,
  };
});

const filterChoice = isSectionSelected ? groupedRows : filteredGroupedRows;
  //Datan ovanför söks igenom  i sökfunktion

//--------------------- ENDOF UPPDELNING AV DATA I SEGMENT + SÖKNING --------------------------- 

//--------------------- VAL AV AVDELNING --------------------------- 
const options = [ //Avdelnings drop down meny
{label: "Alla Avdelningar", value: ""},
{label: "Hjärt och Lung", value: "Hjärt och Lung"},
{label: "Akut", value: "Akut"},
{label: "Barn och Ungdom", value: "Barn och Ungdom"},
{label: "Kirurgi och Urologi", value: "Kirurgi och Urologi"},
{label: "Serviceförråd", value: "Serviceförråd"},
]

  const optionsAdd = [ //Avdelnings drop down meny för manuell tilläggning
    {label: "Hjärt och lung", value: "Hjärt och Lung"},
    {label: "Akut", value: "Akut"},
    {label: "Barn och Ungdom", value: "Barn och Ungdom"},
    {label: "Kirurgi och Urologi", value: "Kirurgi och Urologi"},
{label: "Serviceförråd", value: "Serviceförråd"},
  ]

//--------------------- ENDOF VAL AV AVDELNING --------------------------------- 
  function highlightMatch(text, searchTerm) {
    const regex = new RegExp(`(${searchTerm.trim()})`, 'gi');
    return text.toLowerCase().includes(searchTerm.trim().toLowerCase()) ? (
      <div dangerouslySetInnerHTML={{ __html: text.replace(regex, (match) => `<span style="background-color: yellow">${match}</span>`) }} />
    ) : null;
  }
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



  function handleSelect(event){ //Sätter in värdet i avdelning från vald i drop down
    setAvdelning(event.target.value);
    setMessage("");
  }

  function manHandleSelect(event){ //Sätter in värdet i manAvdelning från vald i drop down för manuell tilläggning
    setManAvdelning(event.target.value);
    setMessage("");
  }

 // Funktion som kollar om det manuellt inmatade datumsträngen har formatet ÅÅÅÅ-MM-DD,
// om år är positiva heltal, om månaden är < 12 och >0,
// om dagarna är positiva heltal och rätt mängd för månaden
function isManualDateAcceptable(manualDate) {
  // Kolla om manualDate matchar formatet ÅÅÅÅ-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(manualDate)) {
    return false;
  }

  // Extrahera år, månad och dag från manualDate
  const [year, month, day] = manualDate.split('-');

  // Kolla om året är ett positivt heltal
  if (!/^\d+$/.test(year) || parseInt(year, 10) <= 0) {
    return false;
  }

  // Kolla om månaden är ett positivt heltal mellan 1 och 12
  if (!/^\d+$/.test(month) || parseInt(month, 10) <= 0 || parseInt(month, 10) > 12) {
    return false;
  }

  // Kolla om dagen är ett positivt heltal och inom det giltiga intervallet för den angivna månaden
  if (!/^\d+$/.test(day) || parseInt(day, 10) <= 0 || parseInt(day, 10) > new Date(year, month, 0).getDate()) {
    return false;
  }

  // Om alla villkor är uppfyllda, returnera true
  return true;
}

function addManually() {
  console.log('lägg till manuellt');
  if (manName === "" || manDate === "" || manLot === "") {
    setMessage("Fyll i alla fält");
  } else {
    var duplicate = false;
    for (const item of medDataArray) {
      if (
        item.gtin.toLowerCase() === manName.toLowerCase() &&
        item.lot === manLot &&
        item.section.toLowerCase() === manAvdelning.toLowerCase()
      ) {
        duplicate = true;
      }
    }
    if (!duplicate && isManualDateAcceptable(manDate)) {
      setButtonPopup(true);
    } else if (!isManualDateAcceptable(manDate)) {
      setMessage("Ogiltigt datum");
    } else {
      setMessage("Läkemedlet finns redan");
    }
  }
}
  
  function submitManually(){ //tilläggning bekräftad, slutför tilläggning till databas och meddela användare, om checkbox checkad rensa alla fält
      submitScannedItem(manName, manDate, manLot, manAvdelning);
      setMessage("Tilläggning lyckades");
      var checkBox = document.getElementById("myCheck");
      console.log("CheckBox: ", checkBox);
      if(checkBox.checked===true){
        console.log("CheckBox.checked: ", document.getElementById('myCheck').checked);
        document.getElementById('input').value = '';
        document.getElementById('input2').value = '';
        document.getElementById('input3').value = '';
        setManName('');
        setManDate('');
        setManLot('');
      }
  }
  function removeManually(){//Ta bort läkemedel, visa pop-up 
    console.log('remove manually')
    setRemoveButtonPopup(true);
  }
  function confirmRemoveManually(){ //borttagning bekräftad, slutför borttagning från databas och meddela användare
    deleteItem(removeGtin, removeExpiry, removeLot, removeSection);
    setMessage("Borttagning lyckades");

    setTimeout(() => {
      setMessage("Borttagning lyckades");
      setRemoved("");
    }, 500);
  }

  //alternera Checked
  const handleCheckboxChange = () => {
    setChecked(!Checked);
  }

  {
    /*Om sökfönster är tomt, renderea som vanligt, annars rendererar man bara de sökninens träffar
                 baserat på läkemedelsnamn eller LOT-nummer. filterChoice sätts beroende på sökrutans inehåll*/
  }
  {
    /*Om sökfönster är tomt, renderea som vanligt, annars rendererar man bara de sökninens träffar
                 baserat på läkemedelsnamn eller LOT-nummer. filterChoice sätts beroende på sökrutans inehåll*/

  }
  const sortedFilterChoice = [...filterChoice].sort((a, b) => {
    // Jämför år
    if (a.year !== b.year) {
      return a.year - b.year;
    }
    // om år är samma, jämför månader
    return a.month - b.month;
  });

let currentYear; //Variabel för att hålla koll på när det är dags att renderera nya "year"-table heads

//Komponent som renderar alla tables
const table = sortedFilterChoice.map(({ year, month, rows }) => {
  const isNewYear = currentYear !== year;
  currentYear = year;

  return (
    <div key={`${year}-${month}`}>
      <table
        style={{
          width: "100%",
        }}
      >
        {/*Renderera bara table head med år om det har skiftat till ett nytt år*/}
           {isNewYear && (
          <thead>
            <tr
            style={{
              border: "1px solid #000",
              textAlign: "center",
              height: "40px",
              background: "#c4c4c4",
              fontSize: "20px",
            }}
          >
              <td className="bold-cell" colSpan="10">
                {year}
              </td>
            </tr>
          </thead>
        )}

        <tbody>
          <tr
            style={{
              border: "1px solid #000",
              textAlign: "left",
              height: "40px",
              background: "#f2f2f2",
              fontSize: "20px",
            }}
          >
            <td className="bold-cell" colSpan="10">
              {getMonthNameFromNumber(month)}  {year}
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
            <th></th>
            {/*<th>Produktkod</th>*/}
            {/*<th>Serienummer</th>*/}
          </tr>
          {rows.map((row) => (
            <tr
              style={{
                border: "0.5px solid grey",
                background: expireSoon(row.expiry)
                ? "Orange"
                : expired(row.expiry)
                ? "#ea6e6e"
                : "#fff",
              }}
            >
              <td>
                {expireSoon(row.expiry) ? (
                  <div
                    className={`custom-tooltip ${isHovered ? "show" : ""}`}
                    onMouseEnter={handleHover}
                    onMouseLeave={handleMouseLeave}
                  >
                    !
                    {isHovered && (
                      <div className="expiring-tooltip-content">
                        Går ut om {daysUntilExpires(row.expiry)} dagar
                      </div>
                    )}
                  </div>
                ) : expired(row.expiry) ? (
                  <div
                    className={`custom-tooltip ${isHovered ? "show" : ""}`}
                    onMouseEnter={handleHover}
                    onMouseLeave={handleMouseLeave}
                  >
                    !
                    {isHovered && (
                      <div className="expired-tooltip-content">Utgången</div>
                    )}
                  </div>
                ) : (
                  <div
                    style={{
                      color: "Green",
                    }}
                  >
                    ✓
                  </div>
                )}
              </td>
              <td>
                {row.gtin
                  .toLowerCase()
                  .includes(searchTerm.trim().toLowerCase())
                  ? highlightMatch(row.gtin, searchTerm)
                  : row.gtin}
              </td>
              <td>
                {row.expiry
                  .toLowerCase()
                  .includes(searchTerm.trim().toLowerCase())
                  ? highlightMatch(row.expiry, searchTerm)
                  : row.expiry}
              </td>
              <td>
                {row.lot.toLowerCase().includes(searchTerm.trim().toLowerCase())
                  ? highlightMatch(row.lot, searchTerm)
                  : row.lot}
              </td>
              <td>
                {/* Endof highlighta text som matchar sökinput, annars renderera som vanligt */}
                <button
                  className="button-remove"
                  onClick={() => {
                    removeManually();
                    setRemoveGtin(row.gtin);
                    setRemoveExpiry(row.expiry);
                    setRemoveLot(row.lot);
                    setRemoveSection(row.section);
                    setMessage("");
                    setRemoved("");
                  }}
                >
                  X
                </button>
              </td>
              {/*<td>{row.product_code}</td>*/}
              {/*<td>{row.serial_number}</td>*/}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

const mobileTable = sortedFilterChoice.map(({ year, month, rows }) => {
  const isNewYear = currentYear !== year;
  currentYear = year;

  return (
    <div key={`${year}-${month}`}>
      <table
        style={{
          width: "100%",
        }}
      >
        {/*Renderera bara table head med år om det har skiftat till ett nytt år*/}
           {isNewYear && (
          <thead>
            <tr
            style={{
              border: "1px solid #000",
              textAlign: "center",
              height: "20px",
              background: "#c4c4c4",
              fontSize: "10px",
            }}
          >
              <td className="bold-cell" colSpan="100%">
                {year}
              </td>
            </tr>
          </thead>
        )}

        <tbody>
          <tr
            style={{
              border: "1px solid #000",
              textAlign: "left",
              height: "20px",
              background: "#f2f2f2",
              fontSize: "10px",
            }}
          >
            <td className="bold-cell" colSpan="100%">
              {getMonthNameFromNumber(month)}  {year}
            </td>
          </tr>
          <tr
            style={{
              border: "0.5px solid #000",
              textAlign: "center",
            }}
          >
            <th>Status</th>
            <th>Namn på läkemedel</th>
            <th>Utgångsdatum</th>
            <th>LOT-nummer</th>
            <th></th>
            {/*<th>Produktkod</th>*/}
            {/*<th>Serienummer</th>*/}
          </tr>
          {rows.map((row) => (
            <tr
              style={{
                border: "0.5px solid grey",
                textAlign: "center",
                background:  expired(row.expiry)
                  ? "#ea6e6e"
                  : "#fff",
              }}
            >
              <td>
                {expireSoon(row.expiry) ? (
                  <div
                    className={`custom-tooltip ${isHovered ? "show" : ""}`}
                    onMouseEnter={handleHover}
                    onMouseLeave={handleMouseLeave}
                  >
                    !
                    {isHovered && (
                      <div className="mobile-expiring-tooltip-content">
                        Går ut om {daysUntilExpires(row.expiry)} dagar
                      </div>
                    )}
                  </div>
                ) : expired(row.expiry) ? (
                  <div
                    className={`custom-tooltip ${isHovered ? "show" : ""}`}
                    onMouseEnter={handleHover}
                    onMouseLeave={handleMouseLeave}
                  >
                    !
                    {isHovered && (
                      <div className="mobile-expired-tooltip-content">Utgången</div>
                    )}
                  </div>
                ) : (
                  <div
                    style={{
                      color: "Green",
                    }}
                  >
                    ✓
                  </div>
                )}
              </td>
              <td>
                {row.gtin
                  .toLowerCase()
                  .includes(searchTerm.trim().toLowerCase())
                  ? highlightMatch(row.gtin, searchTerm)
                  : row.gtin}
              </td>
              <td>
                {row.expiry
                  .toLowerCase()
                  .includes(searchTerm.trim().toLowerCase())
                  ? highlightMatch(row.expiry, searchTerm)
                  : row.expiry}
              </td>
              <td>
                {row.lot.toLowerCase().includes(searchTerm.trim().toLowerCase())
                  ? highlightMatch(row.lot, searchTerm)
                  : row.lot}
              </td>
              <td>
                {/* Endof highlighta text som matchar sökinput, annars renderera som vanligt */}
                <button
                  className="mobile-button-remove"
                  onClick={() => {
                    removeManually();
                    setRemoveGtin(row.gtin);
                    setRemoveExpiry(row.expiry);
                    setRemoveLot(row.lot);
                    setRemoveSection(row.section);
                    setMessage("");
                    setRemoved("");
                  }}
                >
                  X
                </button>
              </td>
              {/*<td>{row.product_code}</td>*/}
              {/*<td>{row.serial_number}</td>*/}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

  // Rendera table
  return (
    isComputer ? 
    <div className="App" >

      <div className="search-bar">{/* Div till val av avdelning och sökning av produkt */}
      
        <div className="left-search">
          <select className="searchBox" style={{width:"40%"}} onChange={handleSelect}> {/* Dropdown meny */}
            {options.map(option => (
              <option value={option.value}>{option.label}</option>
              ))}
          </select>
        </div>
        <div className="title-div">
          <img
              src="Region_skåne-removebg-preview.png"
              alt="Region Skåne Logo"
              className="title-image"
          />
        </div>
        <div className="right-search">
          <div className="right-search">
            <input 
                className="searchBox"
                placeholder="Sök efter Batch/Läkemedelsnamn"
                onChange={(e) => {setSearchTerm(e.target.value); setMessage("")}}
              />
          </div>
        </div>
      </div>
      <div className="center-table">
        <div className="table-outer-div">
          <div className="table-div">

            {table}
          </div>
        </div>
      </div>
        <div className="manual-box"> {/* Div till Manuell input av läkemedel */}
          <div style={{height: "40px", width: "100%"}}><p className="textAdd">Lägg Till Manuellt</p></div>

          <div className="manual-input-div">
            <input
              id="input"
              className="manual-input"
              placeholder="Läkemedelsnamn"
              onChange={(e) => {setManName(e.target.value); setMessage("")}}         
            />
            <input
              id="input2"
              className="manual-input"
              placeholder="Utgångsdatum(ÅÅÅÅ-MM-DD)"
              onChange={(e) => {setManDate(e.target.value); setMessage("")}}
            />
            <input
              id="input3"
              className="manual-input"
              placeholder="Batch-nr"
              onChange={(e) => {setManLot(e.target.value); setMessage("")}}
            />
            <select className="manual-input" onChange={manHandleSelect}> {/* Dropdown meny */}
                {optionsAdd.map(option => (
                  <option value={option.value}>{option.label}</option>
                  ))}
              </select>
            <button className="button-add"
              onClick={() => {addManually(); console.log(Checked, document.getElementById("myCheck").checked);}}
            >Lägg Till
            </button>
            <label className="Check"> Töm fält efter tilläggning
              <input 
                type="checkbox"
                id="myCheck" 
                checked = {Checked}
                onChange={handleCheckboxChange}/>
                <span className="checkmark"></span>
            </label>
            <p className="message">{message}</p>
          </div>
        </div>


      {/* popup för konfimration av tilläggning */}
      <Popup trigger={buttonPopup} setTrigger={setButtonPopup} setManually={submitManually} confirmButtonText="Lägg till">

        <h3>Lägg till:</h3>
        <p>Läkemedelsnamn: {manName}</p>
        <p>Utgångsdatum: {manDate}</p>
        <p>Batch-nr: {manLot}</p>
        <p>Avdelning: {manAvdelning}</p>
      </Popup>
      
      {/* popup för bekräftelse av borttagning */}
      <Popup trigger={removeButtonPopup} setTrigger={setRemoveButtonPopup} setManually={confirmRemoveManually} confirmButtonText="Ta bort">
        <h3>Ta bort:</h3>
        <p> Läkemedelsnamn: {removeGtin}</p>
        <p> Utgångsdatum: {removeExpiry}</p>
        <p> Batch-nr: {removeLot}</p>
        <p> Avdelning: {removeSection}</p>
      </Popup>
    </div>
    : //Else - sats för mobiler-----------------------------------------------------------------------------------------
    <div className="mobile-App" style={{ fontSize: "10px" }}> {/* Justerad textstorlek till mobildisplay */}
    <div className="search-bar">
      <div className="left-search">
        <select className="mobile-searchBox"  onChange={handleSelect}>
          {options.map((option) => (
            <option value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
      <div className="title-div">
      </div>
      <div className="right-search">
        <div className="right-search">
          <input
            className="mobile-searchBox"
            placeholder="Sök efter Batch/Läkemedelsnamn"
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setMessage("");
            }}
          />
        </div>
      </div>
    </div>

    <div className="mobile-center-table">
      <div className="mobile-table-outer-div">
        <div className="mobile-table-div">
          {mobileTable}
          </div>
      </div>
    </div>
    
    <div className="mobile-manual-box">
      <div style={{ height: "10px", width: "100%" }}>
        <p className="mobile-textAdd">Lägg Till Manuellt</p>
      </div>
      
      <div className="manual-input-div">
        <input
              id="input"
              className="mobile-manual-input"
              placeholder="Läkemedelsnamn"
              onChange={(e) => {setManName(e.target.value); setMessage("")}}         
            />
            <input
              id="input2"
              className="mobile-manual-input"
              placeholder="Utgångsdatum(ÅÅÅÅ-MM-DD)"
              onChange={(e) => {setManDate(e.target.value); setMessage("")}}
            />
            <input
              id="input3"
              className="mobile-manual-input"
              placeholder="Batch-nr"
              onChange={(e) => {setManLot(e.target.value); setMessage("")}}
            />
        <select className="mobile-manual-input" onChange={manHandleSelect}>
          {optionsAdd.map((option) => (
            <option value={option.value}>{option.label}</option>
          ))}
        </select>
        <button className="mobile-button-add" onClick={() => addManually()}>
          Lägg Till
        </button>
        <label className="Check"> Töm fält efter tilläggning
              <input 
                type="checkbox"
                id="myCheck" 
                checked = {Checked}
                onChange={handleCheckboxChange}/>
                <span className="checkmark"></span>
            </label>
            <p className="message">{message}</p>
      </div>
    </div>
    
    {/* popup för konfimration av tilläggning */}
    <Popup trigger={buttonPopup} setTrigger={setButtonPopup} setManually={submitManually} confirmButtonText="Lägg till">
        <h3>Lägg till:</h3>
        <p>Läkemedelsnamn: {manName}</p>
        <p>Utgångsdatum: {manDate}</p>
        <p>Batch-nr: {manLot}</p>
        <p>Avdelning: {manAvdelning}</p>
      </Popup>
      
      {/* popup för bekräftelse av borttagning */}
      <Popup trigger={removeButtonPopup} setTrigger={setRemoveButtonPopup} setManually={confirmRemoveManually} confirmButtonText="Ta bort">
        <h3>Ta bort:</h3>
        <p> Läkemedelsnamn: {removeGtin}</p>
        <p> Utgångsdatum: {removeExpiry}</p>
        <p> Batch-nr: {removeLot}</p>
        <p> Avdelning: {removeSection}</p>
      </Popup>
  </div>
  );
}
export default App;