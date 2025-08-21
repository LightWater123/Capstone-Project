export default function UploadPDFModal({
  isOpen,
  onClose,
  onSubmit,
  setPdfFile
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg border border-blue-400">
        <h2 className="text-lg font-bold text-blue-700 mb-4">Upload PDF</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block text-sm font-medium text-blue-700">Select PDF File</label>
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
              onClick={onClose}
              className="text-red-400 hover:underline"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
