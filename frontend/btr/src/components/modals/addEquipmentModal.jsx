export default function AddEquipmentModal({
  isOpen,
  category,
  newItem,
  setNewItem,
  onClose,
  onSubmit,
  onUploadPDF
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-lg border border-yellow-400">
        <h2 className="text-xl font-bold text-yellow-700 mb-4">Add New {category} Equipment</h2>
        <form onSubmit={onSubmit} className="space-y-4 text-black">
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
            className="w-full px-3 py-2 border border-black rounded bg-yellow-100 placeholder-black"
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
          <select
            value={newItem.location}
            onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
            className="w-full px-3 py-2 border border-black rounded bg-yellow-100 text-black"
            required
          >
            <option value="">Select Location</option>
            <option value="RD's Office">RD's Office</option>
            <option value="Storage Room">Storage Room</option>  
            <option value="Conference Room">Conference Room</option>
            <option value="Auditor's Office">Auditor's Office</option>
            <option value="Car Port/Garage">Car Port/Garage</option>
            <option value="CTOO II Office">CTOO II Office</option>
            <option value="Records Room">Records Room</option>
            <option value="Outside the building">Outside the building</option>
            <option value="Within the building">Within the building</option>
          </select>
          <input
            type="text"
            placeholder="Remarks"
            value={newItem.remarks}
            onChange={(e) => setNewItem({ ...newItem, remarks: e.target.value })}
            className="w-full px-3 py-2 border border-black rounded bg-yellow-100 placeholder-black"
          />

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              className="bg-black text-yellow-400 px-4 py-2 rounded hover:bg-yellow-700 hover:text-white"
            >
              Submit
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-red-400 hover:underline"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onUploadPDF}
              className="bg-black text-yellow-400 px-4 py-2 rounded hover:bg-yellow-700 hover:text-white"
            >
              Upload PPE/RPCSP PDF
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
