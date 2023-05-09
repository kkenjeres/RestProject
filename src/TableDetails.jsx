import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import bg from '../src/assets/BG.svg';
import Search from './Search';
import Zahlen from './Zahlen';
import {AiOutlineLeft} from 'react-icons/ai'
import { useHistory } from "react-router-dom"; // Добавьте этот импорт

function TableDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tableData, setTableData] = useState([]);
  const [showZahlen, setShowZahlen] = useState(false);
  
  const handleBack = () => {
    navigate('/');
  };

  const handleZahlenClick = () => {
    setShowZahlen(true);
  };
  const handleCloseZahlen = () => {
    setShowZahlen(false);
  }
  return (
    <div className="w-full h-screen overflow-y-auto font-bold bg-white flex flex-col">
      <div className="flex w-full border-b border-gray-300 my-2 relative">
        <button
          onClick={handleBack}
          className="text-[25px] absolute m-auto top-0 bottom-0"
        >
          <AiOutlineLeft />
        </button>
        <h1 className="text-center text-black font-normal text-[25px] w-full">
          Tisch #{id}
        </h1>
      </div>
  
      <div className="w-[90%] mx-auto flex-grow flex flex-col justify-between">
        <div>
          <Search tableId={id} setTableData={setTableData} />
          <div className="w-full">
            <p className="border-1 border-gray-300"></p>
          </div>
        </div>
        <div className="w-full my-4 text-center ">
          <button
            onClick={handleZahlenClick}
            className="py-2 bg-black text-white w-[90%] rounded-lg"
          >
            Zahlen
          </button>
        </div>
      </div>
      {showZahlen && (
        <Zahlen
          tableId={id}
          setTableData={setTableData}
          onClose={() => setShowZahlen(false)}
        />
      )}
    </div>
  );
  
}

export default TableDetails;
