import {React, useState, useEffect} from 'react' 
import tableImg from '../src/assets/tableImg.svg'
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc } from "firebase/firestore";
import { db } from "../src/firebase";

const Table = () => {
  const [tableData, setTableData] = useState(
    [
      {
        id: 1,
        image: tableImg,
        tasks:[]
      },
      {
        id: 2,
        image: tableImg,
        tasks:[]
      },
      {
        id: 3,
        image: tableImg,
        tasks:[]
      },
      {
        id: 4,
        image: tableImg,
        tasks:[]
      },
      {
        id: 5,
        image: tableImg,
        tasks:[]
      },
      {
        id: 6,
        image: tableImg,
        tasks:[]
      },
      {
        id: 7,
        image: tableImg,
        tasks:[]
      },
      {
        id: 8,
        image: tableImg,
        tasks:[]
      },
      {
        id: 9,
        image: tableImg,
        tasks:[]
      },
      {
        id: 10,
        image: tableImg,
        tasks:[]
      },
      {
        id: 11,
        image: tableImg,
        tasks:[]
      },
      {
        id: 12,
        image: tableImg,
        tasks:[]
      },
      {
        id: 13,
        image: tableImg,
        tasks:[]
      },
      {
        id: 14,
        image: tableImg,
        tasks:[]
      },
      {
        id: 15,
        image: tableImg,
        tasks:[]
      },
      {
        id: 16,
        image: tableImg,
        tasks:[]
      },
      {
        id: 17,
        image: tableImg,
        tasks:[]
      },
      {
        id: 18,
        image: tableImg,
        tasks:[]
      },
      {
        id: 19,
        image: tableImg,
        tasks:[]
      },
      {
        id: 20,
        image: tableImg,
        tasks:[]
      },
      {
        id: 21,
        image: tableImg,
        tasks:[]
      },
      {
        id: 22,
        image: tableImg,
        tasks:[]
      },
      {
        id: 23,
        image: tableImg,
        tasks:[]
      },
      {
        id: 24,
        image: tableImg,
        tasks:[]
      },
      {
        id: 25,
        image: tableImg,
        tasks:[]
      }
    ]);

  const navigate = useNavigate();

  const checkItemsExist = async (tableId) => {
    const querySnapshot = await getDocs(collection(db, `tables/${tableId}/items`));
    return !querySnapshot.empty;
  }

  useEffect(() => {
    const updateTableColors = async () => {
      const updatedTableData = tableData.map(async table => {
        const hasItems = await checkItemsExist(table.id);
        return {
          ...table,
          color: hasItems ? 'bg-green-500 ' : 'bg-gray-500'
        }
      });
      const result = await Promise.all(updatedTableData);
      setTableData(result);
    };
    updateTableColors();
  }, [tableData]);

  const handleClick = (table) => {
    navigate(`/table/${table.id}`);
  };
    
  return (
    <div className='gap-2 grid grid-cols-2 md:space-y-0 pt-20 w-[80%] m-auto pb-20 font-bold'>
      {tableData.map(table => (
        <article
          key={table.id}
          onClick={() => handleClick(table)}
          className={`cursor-pointer cover flex items-center h-[90px] md:items-start md:h-[200px] cursor-pointer rounded-lg ${table.color}`}
        >
          <div className='w-full flex justify-center m-auto'>
            <div className='flex flex-col items-center'>
              <img src={table.image} alt="" className='w-[50px] flex md:w-[100px]'/>
              <p className='text-center'>{"Tisch" + " " + '#' + table.id}</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};


export default Table;