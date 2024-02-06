import { useState, useRef, useEffect, useContext } from 'react';

import { MainContext } from '../../DataTable/DataTable';
import Cell from '../Cell/Cell';
import Pagination from '../Pagination/Pagination';
import './Table.css';
import { IconButtonArrowDown, IconButtonArrowUp } from '../IconButton/IconButton';

export default function Table() {
  const mainContext = useContext(MainContext);
  const [currentRows, setCurrentRows] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowPerPage, setRowPerPage] = useState<number>(mainContext.options?.rowsPerPage ? mainContext.options?.rowsPerPage : 10);
  const sortedField = useRef({ title: '', kind: true });


  const sortData = (fieldTitle: string) => {
    let tempData = [...mainContext.rowData];
    tempData.sort((a: any, b: any) => {
      const nameA = typeof a[fieldTitle] === 'string' ? a[fieldTitle].toUpperCase() : a[fieldTitle];
      const nameB = typeof b[fieldTitle] === 'string' ? b[fieldTitle].toUpperCase() : b[fieldTitle];
      return nameA < nameB ? (sortedField.current.kind ? -1 : 1) : (sortedField.current.kind ? 1 : -1);
    });
    sortedField.current.title = fieldTitle;
    sortedField.current.kind = !sortedField.current.kind;
    mainContext.setRowData(tempData);
  }

  const selectAllRows = (checked: boolean) => {
    let selectRow = (document.querySelectorAll('.rdttable-row__select-cell') as NodeListOf<HTMLInputElement>);
    selectRow.forEach(element => {
      element.checked = checked;
    })
    mainContext.setCountSelectedRows(checked ? selectRow.length : 0);
  }

  const selectRow = (checked: boolean) => {
    mainContext.setCountSelectedRows(checked ? mainContext.countSelectedRows + 1 : mainContext.countSelectedRows - 1);
  }

  const pageNoHandler = (pageNo: number, perPage: number) => {
    setCurrentPage(pageNo);
    setRowPerPage(perPage);
  }

  const pagination = () => {
    let tempRows = [...mainContext.rowData].splice((currentPage - 1) * rowPerPage, rowPerPage);
    setCurrentRows(tempRows);
  }

  const closeMenuSubItems = () => {
    mainContext.setShowMenuSubItems({ filter: false, search: false, displayColumns: false });
  }

  const onRowClick = (rowData: any) => {
    mainContext.options?.onRowClick && mainContext.options?.onRowClick(rowData);
  }

  useEffect(() => {
    pagination();
  }, [currentPage, mainContext.rowData])

  useEffect(() => {
    currentPage != 1 ? setCurrentPage(1) : pagination();
  }, [rowPerPage])

  return (
    <div id='div-table' style={{ color: mainContext.options?.color?.color, backgroundColor: mainContext.options?.color?.backgroundColor, borderColor: mainContext.options?.color?.borderColor }}>
      <table id='data-table' className='rdttable' onClick={closeMenuSubItems}>
        <thead>
          <tr className={mainContext.options?.responsive ? 'rdttable-header--res' : ''}>
            {
              !mainContext.options?.selectableRowsHideCheckboxes &&
              <th style={{ borderColor: mainContext.options?.color?.borderColor }}>
                <input type="checkbox" onChange={event => selectAllRows(event.target.checked)} />
              </th>
            }
            {
              mainContext.columnData.map(header => (
                <th key={header.field.title} className={mainContext.options?.resizableColumns ? 'rdttable-resizable-column' : ''} style={{ borderColor: mainContext.options?.color?.borderColor, display: header.options?.display === false ? 'none' : 'table-cell' }} onClick={() => header.options?.sort && sortData(header.field.title)}>
                  <span className={header.options?.sort ? 'rdttable-header__label' : ''} title={header.options?.sort ? mainContext.options?.textLabels?.body?.toolTip : ''}>{header.label}</span>
                  {sortedField.current.title === header.field.title && !sortedField.current.kind && <IconButtonArrowDown width={15} />}
                  {sortedField.current.title === header.field.title && sortedField.current.kind && <IconButtonArrowUp width={15} />}
                </th>
              ))
            }
          </tr>
        </thead>
        <tbody>
          {
            currentRows.map((data: any) => (
              <tr key={data.id} className={mainContext.options?.responsive ? 'rdttable-row--res' : ''} onClick={() => onRowClick(data)}>
                {
                  !mainContext.options?.selectableRowsHideCheckboxes &&
                  <td className={mainContext.options?.responsive ? 'rdttable-row__select--res' : 'rdttable-row__select'} style={{ borderColor: mainContext.options?.color?.borderColor }}>
                    <input type="checkbox" className='rdttable-row__select-cell' onChange={(event) => selectRow(event.target.checked)} />
                  </td>
                }
                {
                  mainContext.columnData.map((header) => (
                    <td key={header.field.title} className={mainContext.options?.responsive ? 'rdttable-row__data--res' : 'rdttable-row__data'} style={{ borderColor: mainContext.options?.color?.borderColor, display: header.options?.display === false ? 'none' : 'table-cell' }}>
                      <div className={mainContext.options?.responsive ? 'rdttable-row__data-cell--res' : 'rdttable-row__data-cell'}>
                        <span className={mainContext.options?.responsive ? 'rdttable-row__data-label--res' : 'rdttable-row__data-label'}>{header.label}</span>
                        <Cell column={header} row={data} />
                      </div>
                    </td>
                  ))
                }
              </tr>
            ))
          }
        </tbody>
      </table>
      {
        mainContext.rowData.length === 0 &&
        <div className="rdttable-nodata">{mainContext.options?.textLabels?.body?.noMatch}</div>
      }
      {mainContext.options?.pagination && <Pagination pageCount={Math.ceil(mainContext.rowData.length / rowPerPage)} currentPage={currentPage} pageNoHandler={pageNoHandler} previous next first last />}
    </div>
  )
}


