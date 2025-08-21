export default function TypeSelectorModal({
  isOpen,
  onClose,
  onSelectType,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg border border-yellow-400">
        <h2 className="text-xl font-bold text-yellow-700 mb-4">Select Equipment Type</h2>
        <div className="flex gap-4 justify-center">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => {
              onSelectType("PPE");
              onClose();
            }}
          >
            PPE
          </button>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            onClick={() => {
              onSelectType("RPCSP");
              onClose();
            }}
          >
            RPCSP
          </button>
        </div>
      </div>
    </div>
  );
}
