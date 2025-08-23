<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Equipment;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class EquipmentController extends Controller
{
    // valid location values for dropdown selection
    protected array $validLocations = [
        "RD's Office",
        "Conference Room",
        "Auditor's Office",
        "Storage Room",
        "Car Port/Garage",
        "CTOO II Office",
        "Outside the building",
        "Records Room",
        "Within the building"
    ];

    /**
     * GET /api/inventory
     * Retrieve equipment filtered by category (PPE or RPCSP)
     */
    public function index(Request $request)
    {
        $category = $request->query('category');

        // initialize query
        $query = Equipment::query();

        // apply category filter if present
        if ($category) {
            $query->where('category', $category);
        }

        // return matching equipment
        return response()->json($query->get(), 200);
    }

    /**
     * POST /api/inventory
     * Create a new equipment entry
     */
    public function store(Request $request)
    {
        try {
            // Validate incoming request through conditional validation
            $validated = $request->validate([
                'category'        => ['required', 'string', Rule::in(['PPE', 'RPCSP'])],
                'article'         => ['required', 'string'],
                'description'     => ['required', 'string'],
                'property_ro'     => ['required_if:category,PPE', 'string'], // or semi-expendable property no.
                'property_co'     => ['nullable', 'string'], // only for PPE
                'semi_expendable_property_no' => ['required_if:category,RPCSP', 'string'], // only for RPCSP
                'unit'            => ['required', 'string'],
                'unit_value'      => ['required', 'numeric'],
                'recorded_count'  => ['required', 'numeric', 'min:0'], // quantity listed in inventory
                'actual_count'    => ['required', 'numeric', 'min:0'], // actual count of items
                'remarks'         => ['nullable', 'string'],
                'location'        => ['required', 'string', Rule::in($this->validLocations)],
                'condition' => 'nullable|string',
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date',

            ]);

            
            // create and save item
            // $equipment = Equipment::create($validated);
            Log::info('Creating new equipment entry', ['data' => $validated]);
            $equipment = new Equipment();
            $equipment->fill($validated);
            $equipment->date_added = now(); // set date_added to current timestamp
            $equipment->save();
            // return created item to frontend
            return response()->json($equipment, 201);

        } catch (ValidationException $e) {
            // return specific validation errors
            return response()->json([
                'message' => 'Validation failed.',
                'errors'  => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            // log unexpected exceptions and return a generic error response
            Log::error('Equipment creation failed', ['exception' => $e]);

            return response()->json([
                'message' => 'An unexpected error occurred.',
                'error'   => $e->getMessage() // debug, shows error message
            ], 500);
        }
    }
    /**
     * PUT /api/inventory/{id}
     * Update an existing equipment entry
     */
    public function update(Request $request, $id)
    {
        try
        {
            // find id through mongodb id
            $equipment = Equipment::findOrFail($id);

            // validate fields 
            $validated = $request->validate([
                'article'     => ['sometimes', 'string'],
                'description' => ['sometimes', 'string'],
                'property_ro' => ['sometimes', 'string'], // or semi-expendable property no.
                'property_co' => ['nullable', 'string'], // only for PPE
                'semi_expendable_property_no' => ['sometimes', 'string'], // only for RPCSP
                'unit'        => ['sometimes', 'string'],
                'unit_value'  => ['sometimes', 'numeric'],
                'recorded_count' => ['sometimes', 'integer', 'min:0'], // quantity listed in inventory
                'actual_count'   => ['sometimes', 'integer', 'min:0'], // actual count of items
                'remarks'     => ['nullable', 'string'],
                'location'    => ['sometimes', 'string', Rule::in($this->validLocations)],
                'condition' => 'nullable|string',
                'start_date' => 'nullable|date',
                'end_date' => 'nullable|date',
            ]);

            // update field and save
            $equipment->fill($validated)->save();

            // return updated item to frontend
            return response()->json($equipment, 200);

        } catch (ValidationException $e) 
        {
            // return specific validation errors
            Log::error('Equipment update failed', ['exception' => $e]);

            return response()->json([
                'message' => 'Validation failed.',
                'errors'  => $e->errors()
            ], 422);
        }
        catch (\Exception $e)
        {
            // log unexpected exceptions and return a generic error response
            Log::error('Equipment update failed', ['exception' => $e]);

            return response()->json([
                'message' => 'An unexpected error occurred.',
                'error'   => $e->getMessage() // debug, shows error message
            ], 500);
        }
    }

    public function destroy($id)
    {
        try 
        {
            // find id through mongodb id
            $equipment = Equipment::findOrFail($id);

            // delete item
            $equipment->delete();

            return response()->json(['message' => 'Equipment deleted successfully.'], 200);

        } catch (\Exception $e) 
        {
            // log unexpected exceptions and return a generic error response
            Log::error('Equipment deletion failed', ['exception' => $e]);

            return response()->json([
                'message' => 'An unexpected error occurred.',
                'error'   => $e->getMessage() // debug, shows error message
            ], 500);
        }
    }
}
