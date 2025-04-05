import React, { useState, useEffect } from "react";
import {
  useTable,
  usePagination,
  useGlobalFilter,
  useSortBy,
} from "react-table";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaTimes } from "react-icons/fa"; 

// Global Search & Date Filter Component
function GlobalFilter({
  searchTerm,
  setSearchTerm,
  fromDate,
  toDate,
  setFromDate,
  setToDate,
  clearFilters,
  allFiltersSet,
}) {
  return (
    <div className="dataTable_search mb-3">
      <div className="row g-2">
        {/* Search Input (Full width on mobile, limited on desktop) */}
        <div className="col-12 col-md-auto" style={{ position: "relative", maxWidth: "200px" }}>
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
            placeholder="🔍 Search..."
            style={{ paddingRight: "30px" }}
          />
          {searchTerm && (
            <FaTimes
              onClick={() => setSearchTerm("")}
              className="text-danger"
              title="Clear Search"
              style={{
                position: "absolute",
                right: "8px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
              }}
            />
          )}
        </div>

        {/* Date Filters (Second row in mobile, same row in desktop) */}
        <div className="col-12 col-md-auto d-flex gap-2 flex-wrap">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="form-control"
            style={{ maxWidth: "150px" }}
          />
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="form-control"
            style={{ maxWidth: "150px" }}
          />
          {/* Clear Filters Icon (Only when fromDate and toDate are set) */}
          {allFiltersSet && (
            <FaTimes
              onClick={clearFilters}
              className="text-danger fs-4 cursor-pointer"
              title="Clear Filters"
              style={{ cursor: "pointer", marginTop:'7px' }}
            />
          )}
        </div>
      </div>
    </div>
  );
}





// Reusable DataTable Component
export default function DataTable({ columns, data }) {
  const [filteredData, setFilteredData] = useState(data);
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Auto-filter on searchTerm, fromDate, or toDate change
  useEffect(() => {
    applyFilters(searchTerm, fromDate, toDate);
  }, [searchTerm, fromDate, toDate, data]);

  const applyFilters = (searchTerm, fromDate, toDate) => {
    let filtered = data;

    // Apply Search Filter
    if (searchTerm) {
      filtered = filtered.filter((item) =>
        Object.values(item).some(
          (val) =>
            typeof val === "string" &&
            val.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply Date Filter Automatically when both dates are entered
    if (fromDate && toDate) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.date).setHours(0, 0, 0, 0);
        const from = new Date(fromDate).setHours(0, 0, 0, 0);
        const to = new Date(toDate).setHours(0, 0, 0, 0);
        return itemDate >= from && itemDate <= to;
      });
    }

    // Update the table data
    setFilteredData(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFromDate("");
    setToDate("");
    setFilteredData(data);
  };

  const allFiltersSet = fromDate && toDate;

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageOptions,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data: filteredData,
      initialState: { pageIndex: 0, pageSize: 10 },
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  return (
    <div className="dataTable_wrapper container-fluid">
      {/* Filters */}
      <GlobalFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        fromDate={fromDate}
        toDate={toDate}
        setFromDate={setFromDate}
        setToDate={setToDate}
        clearFilters={clearFilters}
        allFiltersSet={allFiltersSet}
      />

      <div className="table-responsive">
        <table {...getTableProps()} className="table table-striped">
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()} className="dataTable_headerRow">
                {headerGroup.headers.map((column) => (
                  <th {...column.getHeaderProps(column.getSortByToggleProps())} className="dataTable_headerCell">
                    {column.render("Header")}
                    <span>
                      {column.isSorted ? (column.isSortedDesc ? " 🔽" : " 🔼") : ""}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()} className="dataTable_body">
            {page.map((row) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} className="dataTable_row">
                  {row.cells.map((cell) => (
                    <td {...cell.getCellProps()} className="dataTable_cell">
                      {cell.render("Cell")}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="d-flex align-items-center justify-content-between mt-3">
        <div className="dataTable_pageInfo" style={{marginLeft:'-20px'}}>
          Page{" "}
          <strong>
            {pageIndex + 1} of {pageOptions.length}
          </strong>
        </div>
        <div className="pagebuttons">
          <button
            className="btn btn-primary me-2 btn1"
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
          >
            Prev
          </button>
          <button
            className="btn btn-primary btn1"
            onClick={() => nextPage()}
            disabled={!canNextPage}
          >
            Next
          </button>
        </div>
        <div>
          <select
            className="form-select form-select-sm"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            {[5, 10, 20].map((size) => (
              <option key={size} value={size}>
                Show {size}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
