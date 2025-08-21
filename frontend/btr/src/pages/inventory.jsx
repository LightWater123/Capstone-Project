import { useState, useEffect, use } from "react";
import axios from "../api/axios";
import Cookie from "js-cookie";
import "../index.css";


export default function InventoryDashboard() {

  axios.defaults.withCredentials = true;

  // currently selected category (PPE or RPCSP)
  const [category, setCategory] = useState("PPE");

  // fetched inventory data from mongodb
  const [inventoryData, setInventoryData] = useState([]);

  // local search filter query
  const [searchQuery, setSearchQuery] = useState("");

  // controls main equipment modal
  const [showModal, setShowModal] = useState(false);

  // category type selector modal
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  // state hooks for pdf parser
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);

  // csrf setup
  useEffect(() => {
    axios.get("http://localhost:8000/sanctum/csrf-cookie", {
      withCredentials: true
    }).then(() => {
      const xsrfToken = Cookie.get("XSRF-TOKEN");
      axios.defaults.headers.common["X-XSRF-TOKEN"] = xsrfToken;
      console.log("CSRF setup complete");
    }).catch((err) => {
      console.error("Error setting CSRF cookie:", err);
    });
  }, []);

  // holds form data for adding new inventory item
  const[newItem, setNewItem] = useState({
    category: category,
    article: "",
    description: "",
    property_ro: "",
    property_co: "", // ppe only
    semi_expendable_property_no: "", // rpcsp only
    recorded_count: 0, // Quantity per Property Card
    actual_count: 0, // Quantity per Physical Count
    unit: "pc",
    unit_value: 0,
    location:"",
    remarks: ""

  });

  // handle submit for adding new inventory item
  const handleSubmit = (e) => {
    e.preventDefault(); // avoid page reload

    // send POST request to backend API
    axios
      .post("/api/inventory", newItem)
      .then((res) => {
        console.log("Item added successfully:", res.data); // log response for debugging

        // reset modal and form state
        setShowModal(false); // close modal
        setNewItem({ // reset form
          category: category,
          article: "",
          description: "",
          property_ro: "",
          property_co: "",
          semi_expendable_property_no: "", // rpcsp only
          unit: "pc", // default unit
          unit_value: 0,
          recorded_count: 0, // Quantity per Property Card
          actual_count: 0, // Quantity per Physical Count
          location:"",
          remarks: ""
        });

        // refetch inventory data
        axios.get(`/api/inventory?category=${category}`) // fetch by category
          .then((res) => setInventoryData(res.data))
          .catch((err) => {
            console.error("Error fetching inventory:", err);
            setInventoryData([]); // reset data on error
          });
      })
      .catch((err) => {
        if(err.response && err.response.status === 422) {
          console.error("Validation error:", err.response.data);
          alert("Please fill in all required fields correctly.");
        } else {
          console.error("Error adding item:", err);
          alert("An error occurred while adding the item. Please try again.");
        }
      });
  };

  // handle PDF upload and parsing
  const handlePdfUpload = async (e) => 
    {
      e.preventDefault(); // prevent default form submission

      const formData = new FormData();
      formData.append("pdf", pdfFile);
      formData.append("mode", category); // add mode (PPE or RPCSP)

      try
      {
        // send POST request to backend API for PDF parsing
        const res = await axios.post("http://localhost:8000/api/parse-pdf", formData, {
          headers: {"Content-Type": "multipart/form-data" },
        });

        const rows = res.data.data; // get first row of parsed data

        // check if rows are empty
        if(!rows || rows.length === 0)
          {
            alert('No data found in the PDF. Please check the file and try again.');
            return;
          }

        const firstRow = rows[0]; // get first row of data

        setNewItem((prev) => ({
          ...prev,
          article: firstRow.article || "",
          description: firstRow.description || "",
          property_ro: firstRow.property_RO || "",
          property_co: firstRow.property_CO || "",
          semi_expendable_property_no: firstRow.semi_expendable_property_no || "",
          unit: firstRow.unit_of_measure || "",
          unit_value: Number(firstRow.unit_value) ? Number(firstRow.unit_value) : 0,
          recorded_count: Number(firstRow.quantity_per_property_card) ? Number(firstRow.quantity_per_property_card) : 0,
          actual_count: Number(firstRow.quantity_per_physical_count) ? Number(firstRow.quantity_per_physical_count) : 0,
          location: firstRow.whereabouts || "",
          remarks: firstRow.remarks || ""
        }));

        setShowPdfModal(false); // close PDF modal

      } catch (err) 
      {
        console.error("PDF parse error: ", err);
        alert("An error occurred while parsing the PDF. Please try again.");
      }
    };


  // fetch inventory data when category changes
  useEffect(() => {
    axios
      .get(`/api/inventory?category=${category}`) // fetch by category
      .then((res) => setInventoryData(res.data))
      .catch((err) => {
        console.error("Error fetching inventory:", err);
        setInventoryData([]);
      });
  }, [category]);

  // sync newItem.category with selected category
  useEffect(() => {
    setNewItem((prev) => ({ ...prev, category }));
  }, [category]);

  // filter data based on article or description search
  const filteredData = inventoryData.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.article?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query)
    );
  });

  // render component UI
  return (
    <>
      {/* header section */}
      <div className="header px-4 py-3 border-b bg-white">
        <h1 className="text-2xl font-bold text-gray-800">
          Preventive Maintenance - Inventory
        </h1>
      </div>

      {/* category tab buttons */}
      <div className="flex gap-4 px-4 pt-4">
        <button
          className={`px-4 py-2 rounded-md ${
            category === "PPE" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setCategory("PPE")}
        >
          PPE
        </button>
        <button
          className={`px-4 py-2 rounded-md ${
            category === "RPCSP" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setCategory("RPCSP")}
        >
          RPCSP
        </button>
      </div>

      {/* search input field */}
      <div className="px-4 pt-4">
        <input
          type="text"
          placeholder={`Search ${category} items...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* ADD NEW ITEM BUTTON */}

      <div className="px-4 pt-4">
      <button
        className="bg-yellow-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-yellow-600"
        onClick={() => setShowTypeSelector(true)}
      >
        Add Equipment
      </button>

      {/* TYPE SELECTOR MODAL */}
      {showTypeSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg border border-yellow-400">
            <h2 className="text-xl font-bold text-yellow-700 mb-4">Select Equipment Type</h2>
            <div className="flex gap-4 justify-center">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => {
                  setCategory("PPE");
                  setNewItem((prev) => ({ ...prev, category: "PPE" }));
                  setShowTypeSelector(false);
                  setShowModal(true);
                }}
              >
                PPE
              </button>
              <button
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                onClick={() => {
                  setCategory("RPCSP");
                  setNewItem((prev) => ({ ...prev, category: "RPCSP" }));
                  setShowTypeSelector(false);
                  setShowModal(true);
                }}
              >
                RPCSP
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD EQUIPMENT FORM MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-lg border border-yellow-400">
            <h2 className="text-xl font-bold text-yellow-700 mb-4">Add New {category} Equipment</h2>
            <form onSubmit={handleSubmit} className="space-y-4 text-black">
              {/* FORM FIELDS */}
              <input
                type="text"
                placeholder="Article"
                value={newItem.article}
                onChange={(e) => setNewItem({ ...newItem, article: e.target.value })}
                className="w-full px-3 py-2 border border-black rounded bg-yellow-100 placeholder-black"
                required
              />
              <input
                type="text"
                placeholder="Description"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                className="w-full px-3 py-2 border border-black rounded bg-yellow-100 placeholder-black"
              />
              {category === "PPE" ? (
                <>
                  <input
                    type="text"
                    placeholder="Property RO"
                    value={newItem.property_ro}
                    onChange={(e) => setNewItem({ ...newItem, property_ro: e.target.value })}
                    className="w-full px-3 py-2 border border-black rounded bg-yellow-100 placeholder-black"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Property CO"
                    value={newItem.property_co}
                    onChange={(e) => setNewItem({ ...newItem, property_co: e.target.value })}
                    className="w-full px-3 py-2 border border-black rounded bg-yellow-100 placeholder-black"
                  />
                </>
              ) : (
                <input
                  type="text"
                  placeholder="Semi-Expendable Property No"
                  value={newItem.semi_expendable_property_no}
                  onChange={(e) => setNewItem({ ...newItem, semi_expendable_property_no: e.target.value })}
                  className="w-full px-3 py-2 border border-black rounded bg-yellow-100 placeholder-black"
                  required
                />
              )}
              <input
                type="text"
                placeholder="Unit"
                value={newItem.unit}
                onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                className="w-full px-3 py-2 border border-black rounded bg-yellow-100 placeholder-black"
                required
              />
              <input
                type="number"
                placeholder="Unit Value"
                value={newItem.unit_value === 0 ? '' : newItem.unit_value}
                onChange={(e) => {
                  const value = e.target.value === '' ? 0 : Number(e.target.value);
                  setNewItem({ ...newItem, unit_value: value });
                }}
                className="w-full px-3 py-2 border border-black rounded bg-yellow-100 placeholder-black"
                required
              />
              <input
                type="number"
                placeholder="Quantity per Property Card"
                value={newItem.recorded_count === 0 ? '' : newItem.recorded_count}
                onChange={(e) => {
                const value = e.target.value === '' ? 0 : Number(e.target.value);
                setNewItem({ ...newItem, recorded_count: value });
                }}
                className="w-full px-3 py-2 border border-black rounded bg-yellow-100 placeholder-black no-spinner"
                required
              />
              <input
                type="number"
                placeholder="Quantity per Physical Count"
                value={newItem.actual_count === 0 ? '' : newItem.actual_count}
                onChange={(e) => {
                  const value = e.target.value === '' ? 0 : Number(e.target.value);
                  setNewItem({ ...newItem, actual_count: value });
                }}
                className="w-full px-3 py-2 border border-black rounded bg-yellow-100 placeholder-black"
                required
              />
              <input
                type="text"
                placeholder="Location"
                value={newItem.location}
                onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                className="w-full px-3 py-2 border border-black rounded bg-yellow-100 placeholder-black"
                required
              />
              <input
                type="text"
                placeholder="Remarks"
                value={newItem.remarks}
                onChange={(e) => setNewItem({ ...newItem, remarks: e.target.value })}
                className="w-full px-3 py-2 border border-black rounded bg-yellow-100 placeholder-black"
              />

              {/* Buttons */}
              <div className="flex items-center gap-4 pt-2">
                <button
                  type="submit"
                  className="bg-black text-yellow-400 px-4 py-2 rounded hover:bg-yellow-700 hover:text-white"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setNewItem({
                      category: category,
                      article: "",
                      description: "",
                      property_ro: "",
                      property_co: "",
                      semi_expendable_property_no: "",
                      unit: "pc",
                      unit_value: 0,
                      recorded_count: 0,
                      actual_count: 0,
                      location: "",
                      remarks: ""
                    });
                  }}
                  className="text-red-400 hover:underline"
                >
                  Cancel
                </button>

                <button
                type="button"
                  onClick={() => {
                    setShowPdfModal(true);
                  }}
                className = "bg-black text-yellow-400 px-4 py-2 rounded hover:bg-yellow-700 hover:text-white"
                >
                  Upload PPE/RPCSP PDF
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF UPLOAD MODAL */}
      {showPdfModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg border border-blue-400">
            <h2 className="text-lg font-bold text-blue-700 mb-4">Upload PDF</h2>
            <form onSubmit={handlePdfUpload} className="space-y-4">
              <label className ="block text-sm font-medium text-blue-700">Select PDF File</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setPdfFile(e.target.files[0])}
                className="w-full px-3 py-2 border border-black rounded bg-blue-100 text-black"
                required
              />
              <div className="flex justify-end gap-4 pt-2">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Parse PDF
                </button>
                <button
                  type="button"
                  onClick={() => setShowPdfModal(false)}
                  className="text-red-400 hover:underline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>    


    {/* inventory data table */}
    <div className="px-4 pt-6">
      {filteredData.length === 0 ? (
        <p className="text-gray-500">No equipment found in {category}.</p>
      ) : (
        <table className="w-full table-auto border border-gray-300">
          <thead className="bg-black-100">
          <tr>
            <th className="border px-2 py-1">Article</th>
            <th className="border px-2 py-1">Description</th>
            {category === "PPE" ? (
              <>
                <th className="border px-2 py-1">Property Number (RO)</th>
                <th className="border px-2 py-1">Property Number (CO)</th>
              </>
            ) : (
              <>
                <th className="border px-2 py-1">Semi-Expendable Property No.</th>
              </>
            )}
            <th className="border px-2 py-1">Unit</th>
            <th className="border px-2 py-1">Unit Value</th>
            <th className="border px-2 py-1">Quantity per property card</th>
            <th className="border px-2 py-1">Quantity per physical count</th>

            {/* Grouped header */}
            <th className="border px-2 py-1 text-center" colSpan="2">Shortage / Overage</th>

            <th className="border px-2 py-1">Location</th>
            <th className="border px-2 py-1">Remarks</th>
          </tr>
          <tr>
            <th></th>
            <th></th>
            {category === "PPE" ? (
              <>
                <th></th>
                <th></th>
              </>
            ) : (
              <>
                <th></th>
              </>
            )}
            <th></th>
            <th></th>
            <th></th>
            <th></th>

            {/* Sub-columns */}
            <th className="border px-2 py-1 text-center">Qty</th>
            <th className="border px-2 py-1 text-center">Value</th>

            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item, index) => (
            <tr key={index}>
              <td className="border px-2 py-1 text-center">{item.article}</td>
              <td className="border px-2 py-1 text-center">{item.description}</td>
              {item.category === "PPE" ? (
                <>
                  <td className="border px-2 py-1 text-center">{item.property_ro}</td>
                  <td className="border px-2 py-1">
                    {item.property_co ? item.property_co : <span className="text-gray-400 italic text-center">—</span>}
                  </td>
                </>
              ) : (
                <>
                  <td className="border px-2 py-1 text-center">{item.semi_expendable_property_no}</td>
                </>
              )}
              <td className="border px-2 py-1 text-center">{item.unit}</td>
              <td className="border px-2 py-1 text-center">₱{Number(item.unit_value).toLocaleString()}</td>
              <td className="border px-2 py-1 text-center">{item.recorded_count}</td>
              <td className="border px-2 py-1 text-center">{item.actual_count}</td>

              {/* Qty Diff */}
              <td className={`border px-2 py-1 text-center ${
                item.shortage_or_overage_qty < 0
                  ? 'text-red-600'
                  : item.shortage_or_overage_qty > 0
                  ? 'text-green-600'
                  : 'text-white-500'
              }`}>
                {item.shortage_or_overage_qty}
              </td>

              {/* Value Diff */}
              <td className={`border px-2 py-1 text-center ${
                item.shortage_or_overage_val < 0
                  ? 'text-red-600'
                  : item.shortage_or_overage_val > 0
                  ? 'text-green-600'
                  : 'text-white-500'
              }`}>
                {item.shortage_or_overage_val === 0
                  ? '₱0'
                  : `${item.shortage_or_overage_val < 0 ? '-' : '+'}₱${Math.abs(item.shortage_or_overage_val).toLocaleString()}`}
              </td>

              <td className="border px-2 py-1 text-center">{item.location}</td>
              <td className="border px-2 py-1 text-center">{item.remarks}</td>
            </tr>
          ))}
        </tbody>
        </table>
      )}
    </div>
    </>
  );
}