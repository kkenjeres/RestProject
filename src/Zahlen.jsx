

import { useEffect, useState } from "react";
import React from "react";
import { db } from "../src/firebase";
import { collection, doc, getDocs, onSnapshot, updateDoc, deleteDoc } from "firebase/firestore";
import logo from '../src/assets/logo.jpg'

const Zahlen = ({ id, setTableData, tableId, onClose }) => {
  const [firebaseData, setFirebaseData] = useState([]);
  const [splitItems, setSplitItems] = useState([]);
  const [selectedQuantities, setSelectedQuantities] = useState({});
  const handleQuantityChange = (itemId, quantity) => {
    setSelectedQuantities({ ...selectedQuantities, [itemId]: quantity });
  };
  const handleRowClick = (item, e) => {
    if (e.target.name === "quantity") return; // Игнорируем клик на инпуте
  
    handleItemSelection(item);
  };
  
  const handleItemSelection = (item) => {
    const itemWithExtras = { ...item };
  
    if (item.extras) {
      itemWithExtras.extras = item.extras.map((extra) => ({ ...extra }));
    }
  
    const selectedQuantity = selectedQuantities[item.id] || item.quantity;
  
    if (splitItems.some((i) => i.id === item.id)) {
      setSplitItems(splitItems.filter((i) => i.id !== item.id));
      setSelectedQuantities({ ...selectedQuantities, [item.id]: "" });
    } else {
      itemWithExtras.selectedQuantity = Number(selectedQuantity);
      setSplitItems([...splitItems, itemWithExtras]);
    }
  };
  
  
  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "tables", tableId, "items"));
      const firebaseData = querySnapshot.docs.map((doc) => doc.data());
      setFirebaseData(firebaseData);
    };

    fetchData();
  }, [tableId]);

  const totalPrice = firebaseData.reduce((acc, item) => {
    let itemTotal = item.price * item.quantity;
  
    if (item.extras) {
      itemTotal += item.extras.reduce((extraAcc, extra) => {
        return extraAcc + extra.price * extra.quantity;
      }, 0);
    }
  
    return acc + itemTotal;
  }, 0);
  

  const handleClearTableClick = async () => {
    try {
      const tableItemsRef = collection(db, "tables", tableId, "items");
      const tableItemsSnapshot = await getDocs(tableItemsRef);
      tableItemsSnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });
      setTableData([]);
      onClose();
    } catch (error) {
      console.error("Error clearing table in Firestore: ", error);
    }
  };

  const handleBackClick = () => {
    onClose();
  };
  const splitTotalPrice = splitItems.reduce((acc, item) => {
    const selectedQuantity = selectedQuantities[item.id] || item.quantity;
    let itemTotal = item.price * selectedQuantity;
  
    if (item.extras) {
      itemTotal += item.extras.reduce((extraAcc, extra) => {
        return extraAcc + extra.price * selectedQuantity;
      }, 0);
    }
  
    return acc + itemTotal;
  }, 0);
  
  
  
  const handlePaySelectedItems = async () => {
    const newFirebaseData = [...firebaseData];
  
    for (const item of splitItems) {
      const selectedItemQuantity = selectedQuantities[item.id] || item.quantity;
      if (selectedItemQuantity < item.quantity) {
        await updateDoc(
          doc(collection(db, "tables", tableId, "items"), item.id.toString()),
          { quantity: item.quantity - selectedItemQuantity }
        );
  
        // Обновление оставшегося количества элементов в newFirebaseData
        const index = newFirebaseData.findIndex((i) => i.id === item.id);
        newFirebaseData[index].quantity -= selectedItemQuantity;
      } else {
        await deleteDoc(
          doc(collection(db, "tables", tableId, "items"), item.id.toString())
        );
  
        // Удаление оплаченных элементов из newFirebaseData
        const index = newFirebaseData.findIndex((i) => i.id === item.id);
        newFirebaseData.splice(index, 1);
      }
    }
  
    // Обновление состояния FirebaseData
    setFirebaseData(newFirebaseData);
  
    // Очистка выбранных элементов и выбранных количеств
    setSplitItems([]);
    setSelectedQuantities({});
  };
  
  
   
  const incrementQuantity = (itemId) => {
    const currentQuantity = selectedQuantities[itemId] || 1;
    setSelectedQuantities({ ...selectedQuantities, [itemId]: currentQuantity + 1 });
  };
  
  const decrementQuantity = (itemId, itemQuantity) => {
    const currentQuantity = selectedQuantities[itemId] || 1;
    if (currentQuantity > 1) {
      setSelectedQuantities({ ...selectedQuantities, [itemId]: currentQuantity - 1 });
    } else {
      setSelectedQuantities({ ...selectedQuantities, [itemId]: itemQuantity });
    }
  };
  return (
    <div className='fixed w-full h-full top-0 left-0 flex  justify-center bg-white overflow-y-auto '>
      <div className='w-full'>
        <div className='bg-white px-4 py-10  flex flex-col items-center justify-center'>
        <img src={logo} alt="" className='w-[100px]'/>
          <h1 className='text-[30px] mb-10'>Al Vecchio Mulino</h1>
          <div className='flex flex-col text-center mb-10 w-full'>
            <div className='mb-20'>
              <p>Augsburger Str. 672</p>
              <p>70239 Stuttgart Obertürkheim</p>
              <p>Tel: 0711 32 69 83</p>
              <p>St. Nr. :97396/68694</p>
            </div>
            <p className='text-black text-[24px] w-full tex-left mb-4 text-left'>Tisch: {tableId}</p>
            <div className='w-full flex flex-col items-center'>
              <div className='w-[90%]'>

                <table className=' font-normal w-full'>
                  <thead className='text-left'>
                    <tr>
                      <th>M</th>
                      <th>Beschreibung</th>
                      <th className='text-center'>EP</th>
                      <th className='text-center' >Gesamt</th>
                      <th className='text-right'>%</th>
                    </tr>
                  </thead>
                  
                  <tbody>
  {firebaseData.map((item, index) => (
    <React.Fragment key={index}>
      <tr
        className={`text-black text-left ${
          splitItems.some((i) => i.id === item.id) ? "bg-green-300" : ""
        }`}
        onClick={(e) => handleRowClick(item, e)}
      >
        <td className="flex justify-center items-center">
          {splitItems.some((i) => i.id === item.id) && item.quantity > 1 && ( // Добавлено условие для отображения кнопок плюс и минус
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  decrementQuantity(item.id, item.quantity);
                }}
                className="px-2 py-1 bg-gray-200 text-black font-semibold"
              >
                -
              </button>
              <span className="mx-2">
                {selectedQuantities[item.id] || item.quantity}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  incrementQuantity(item.id);
                }}
                className="px-2 py-1 bg-gray-200 text-black font-semibold"
              >
                +
              </button>
            </>
          )}
        </td>
        <td>{item.quantity}</td>
        <td className="text-left">{item.text}</td>
        <td className="text-center">{item.price.toFixed(2)}</td>
        <td className="text-center">{(item.price * item.quantity).toFixed(2)}</td>
        <td className="text-right">{item.percent}</td>
      </tr>
      {item.extras &&
        item.extras.map((extra, extraIndex) => (
          <tr
            key={`${index}-${extraIndex}`}
            className={`text-black text-left ${
              splitItems.some((i) => i.id === item.id) ? "bg-green-300" : ""
            }`}
            onClick={() => handleItemSelection(item)}
          >
            <td>{extra.quantity = ''}</td>
            <td className="text-left pl-2">+ {extra.text}</td>
            <td className="text-center">{extra.price.toFixed(2)}</td>
            <td className='text-center'>{extra.price.toFixed(2)}</td>
            <td className="text-right">{extra.percent}</td>
          </tr>
        ))}
    </React.Fragment>
  ))}
</tbody>



                </table>
                -----------------------------------------------------------
                <div className='flex'>
                  <p className='text-black text-[16px] text-center w-full'>Zwischensumme: </p>
                  <p> {totalPrice.toFixed(2)}</p>

                </div>
                
                -----------------------------------------------------------
                <table className='w-full'>
  <thead >
    <tr className=' '>
      <th className='text-left w-[25%]'>MwSt %</th>
      <th className='text-center w-[25%]'>Netto</th>
      <th className='text-center w-[25%]'>MwSt</th>
      <th className='text-right w-[25%]'>Brutto</th>
    </tr>
  </thead>
  {firebaseData.length > 0 && (
    <tbody>
      {firebaseData.reduce((acc, item) => {
        const group = acc.find((group) => group.percent === item.percent);
        if (group) {
          group.items.push(item);
        } else {
          acc.push({
            percent: item.percent,
            items: [item],
          });
        }
        return acc;
      }, []).map((group) => (
        <tr key={group.percent} className=' '>
          <td className='text-left w-[25%]'>{group.percent} %</td>
          <td className='text-center w-[25%]'>{ 
            group.items.reduce((total, item) => {
              const totalPrice = item.price * item.quantity;
              const netto = totalPrice / (1 + item.percent / 100);
              return total + netto;
            }, 0).toFixed(2)
          }</td>
          <td className='text-center w-[25%]'>{
            group.items.reduce((total, item) => {
              const totalPrice = item.price * item.quantity;
              const netto = totalPrice / (1 + item.percent / 100);
              const mwst = totalPrice - netto;
              return total + mwst;
            }, 0).toFixed(2)
          }</td>
          <td className='text-right w-[25%]'>{
            group.items.reduce((total, item) => {
              const totalPrice = item.price * item.quantity;
              const brutto = totalPrice;
              return total + brutto;
            }, 0).toFixed(2)
          }</td>
        </tr>
      ))}
    </tbody>
  )}
</table>

              </div>
            </div>
            -----------------------------------------------------------

            <div className='w-full my-4 flex justify-center'>
              <div className='flex justify-between items-center w-[90%]'>
                <p className='text-black text-[20px]'>Betrag bezahlt:</p>
                <p className='text-black text-[24px]'>{(splitItems.length ? splitTotalPrice : totalPrice).toFixed(2) + ' Euro'}</p>
              </div>
              
            </div>
            -----------------------------------------------------------
            <div className='flex flex-col w-full'>
              <span>IBAN: DE07600501010008770088</span>
              <span>BIC: SOLADEST600</span>
            </div>
            -----------------------------------------------------------
            <p>Wir wünsche Ihnen einen shcönen Tag </p>
            <button onClick={handlePaySelectedItems} className='px-4 py-2 rounded-full bg-black mt-10 text-white'>Pay Selected Items</button>

            <button onClick={handleClearTableClick} className='px-4 py-2 rounded-full bg-black mt-10 text-white'>Zahlen</button>
            <button onClick={handleBackClick} className='px-4 py-2 rounded-full bg-white border border-black mt-10 text-black'>Zurück</button>
          </div>
        </div>
      </div>
    </div>
  )
}


export default Zahlen;
