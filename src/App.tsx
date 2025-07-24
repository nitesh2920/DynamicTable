import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import type { DataTableStateEvent } from 'primereact/datatable';

import { Column } from 'primereact/column';
import { OverlayPanel } from 'primereact/overlaypanel';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { FaAngleDown } from 'react-icons/fa';
import 'primereact/resources/themes/vela-purple/theme.css'

import 'primereact/resources/primereact.min.css';

interface TableDataProp {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscription: string;
  date_start: number;
  date_end: number;
}

const App: React.FC = () => {
  const [records, setRecords] = useState<TableDataProp[]>([]);
  const [selectedRecords, setSelectedRecords] = useState<TableDataProp[]>([]);
  const [currentPageStart, setCurrentPageStart] = useState(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [inputRows, setInputRows] = useState('');
 

  const overlayRef = useRef<OverlayPanel>(null);
  const dropdownButtonRef = useRef(null);
 const rowsPerPage = 12;
  // Fetch data function
  const loadData = async (pageIndex: number, pageSize: number) => {
    try {
      const res = await fetch(
        `https://api.artic.edu/api/v1/artworks?page=${pageIndex + 1}&limit=${pageSize}`
      );
      const json = await res.json();
      setRecords(json.data);
      setTotalCount(json.pagination.total);
    } catch (error) {
      console.error('Error loading artworks:', error);
    }
  };

  useEffect(() => {
    loadData(0, rowsPerPage);
  }, []);

  const handlePageChange = (event: DataTableStateEvent) => {
    setCurrentPageStart(event.first || 0);
    const pageNum = event.page || 0;
    const numRows = event.rows || rowsPerPage;
    loadData(pageNum, numRows);
  };

const handleRowCountSubmit = async () => {
  const count = Number(inputRows);
  if (count > 0) {
    try {
      const res = await fetch(`https://api.artic.edu/api/v1/artworks?page=1&limit=${count}`);
      const json = await res.json();
      setSelectedRecords(json.data.slice(0, count));
    } catch (error) {
      console.error('Error fetching artworks for selection:', error);
    }
  }
  overlayRef.current?.hide();
};

const loader=()=>(
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border "></div>
  </div>
)

  const HeaderIcons = () => (
    <div style={{ textAlign: 'center', padding: '.5rem' }}>
      <Button
        icon={<FaAngleDown />}
        tooltip="Set selected rows"
        className="p-button-rounded p-button-text"
        onClick={e => overlayRef.current?.toggle(e)}
        ref={dropdownButtonRef}
        aria-label="Toggle row count input"
      />
    </div>
  );

  return (
   <>
  <h1 className="text-5xl sm:text-7xl font-extrabold text-center py-14 select-none">
    Dynamic Table
  </h1>

  <OverlayPanel
    ref={overlayRef}
    showCloseIcon
    dismissable
    style={{ width: '280px' }}
    className="!p-6 rounded-lg shadow-xl bg-white"
  >
    <div className="flex flex-col gap-4">
      <InputText
        placeholder="Number of rows..."
        value={inputRows}
        onChange={(e)=> setInputRows(e.target.value)}
        inputMode="numeric"
        aria-label="Number of rows to select"
        className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
      />
      <Button
        label="Apply"
        onClick={handleRowCountSubmit}
        className="bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 font-semibold rounded-md text-white py-3 transition"
      />
    </div>
  </OverlayPanel>

 <DataTable
  value={records}
  paginator
  rows={rowsPerPage}
  first={currentPageStart}
  totalRecords={totalCount}
  lazy
  dataKey="id"
  selection={selectedRecords}
  onSelectionChange={e => setSelectedRecords(e.value)}
  selectionMode="multiple"
  onPage={handlePageChange}
  header={null}
  className="shadow-lg rounded-lg overflow-hidden border border-gray-200"
  emptyMessage={loader}

>
  <Column
    selectionMode="multiple"
    header={HeaderIcons}
    style={{ width: '3.5em', textAlign: 'center' }}
   
  />
  <Column field="title" header="Title"  />
  <Column field="place_of_origin" header="Origin"  />
  <Column field="artist_display" header="Artist"  />
  <Column field="inscription" header="Inscription"  />
  <Column field="date_start" header="Start Year" />
  <Column field="date_end" header="End Year"  />
</DataTable>

</>
  );
};

export default App;
