<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PdfParserController extends Controller
{
    public function parse(Request $request)
    {
        $request->validate([
            'pdf' => 'required|file|mimes:pdf',
            'mode' => 'required|string|in:PPE,RPCSP'
        ]);

        // save uploaded file temporarily
        $path = $request->file('pdf')->store('temp');
        $fullPath = storage_path("app/{$path}");
        $mode = strtoupper($request->input('mode'));

        // call the Python script with the file path and mode
        $command = escapeshellcmd("python3 parse_pdf.py {$fullPath} {$mode}");
        $output = shell_exec($command);

        // return the output as JSON
        $parsed = json_decode($output, true);
        return response()->json($parsed, 200);
    }
}
