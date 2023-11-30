import { db } from "../firebase_setup/firebase"
import { addDoc, getDocs, deleteDoc, collection, query, where, doc } from "@firebase/firestore"
//import { async } from '@firebase/util';
import MedInformation from '../data/MedInformation.js';
 
export const validateSection = async (sectionId) => {
    console.log("Querying for ID:", sectionId); // Log the ID being queried
  
    const q = query(collection(db, "departments"), where("id", "==", sectionId));
  
    try {
      const querySnapshot = await getDocs(q);
      console.log("Query results:", querySnapshot.docs.map(doc => doc.data())); // Log the query results
  
      if (!querySnapshot.empty) {
        const document = querySnapshot.docs[0].data();
        return document.name;
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error validating section: ", error);
      return null;
    }
  };

export const getMedData = async () => {
    // Create query for med-data
    const q = query(collection(db, "med-data"));
    const fs = require('fs');

    try {
        // Execute query
        const querySnapshot = await getDocs(q);
        console.log("Query results:", querySnapshot.docs.map(doc => doc.data())); // Log the query results

        if (!querySnapshot.empty) {
            const document = querySnapshot.docs.map(doc => doc.data());
            // fs.writeFile('src/data.json', JSON.stringify(document), (err) => {
            //     if (err) {
            //       console.error('Error writing to JSON file:', err);
            //     } else {
            //       console.log('Data written to JSON file successfully.');
            //     }
            // });

            localStorage.setItem('medData', JSON.stringify(document));
            console.log('document: ', JSON.stringify(document));
            //return JSON.stringify(document);
            return document;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error validating section: ", error);
        return null;
    }
}

  export const submitScannedItem = async (manName, manDate, manLot, manAvdelning) => {
    try {
      const medItem = new MedInformation(manName, manDate, manLot, "0", manAvdelning);
      console.log("hello from service :", {medItem});
      const parsedData = parseItemData(medItem);
      console.log(parsedData);
      const docRef = await addDoc(collection(db, 'med-data'), parsedData);
        console.log('Document written with ID: ', docRef.id);
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  };
  export const deleteItem = async (manName, manDate, manLot) => {
    try {
    
      const medCollectionRef = collection(db, 'med-data');
  
      // Create a query to find the document to delete
      const q = query(
        medCollectionRef,
        where('gtin', '==', manName),
        where('expiry', '==', manDate),
        where('lot', '==', manLot)
      );
  
      // Execute the query
      const querySnapshot = await getDocs(q);
      
      // Check if a document matching the query exists
      if (!querySnapshot.empty) {
        // Get the reference to the document
        const medItemDocRef = doc(db, 'med-data', querySnapshot.docs[0].id);
  
        // Delete the document
        await deleteDoc(medItemDocRef);
        console.log('Document deleted successfully.');
      } else {
        console.log('Document not found.');
      }
    } catch (e) {
      console.error('Error deleting row: ', e);
    }
  };
  
    // A function to parse the item data (modify this according to your data format)
    const parseItemData = (medInfo) => {
      // Check if medInfo is an instance of MedInformation and has the necessary fields
      if (medInfo instanceof MedInformation) {
        return {
          expiry: medInfo.expiry,
          gtin: medInfo.gtin,
          lot: medInfo.lot,
          serial: medInfo.serial,
          section: medInfo.section
        };
      } else {
        // Handle the case where medInfo is not a valid instance of MedInformation
        console.error('Invalid medInfo data:', medInfo);
        return {
          expiry: 'N/A',
          gtin: 'N/A',
          lot: 'N/A',
          serial: 'N/A',
          section: 'N/A'
        };
      }
    };
 