<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class PdfParserController extends Controller
{
    public function parse(Request $request)
    {
        try 
        {
            // validate incoming request
        $request->validate([
            'pdf' => 'required|file|mimes:pdf|max:10240',
            'mode' => 'required|string|in:PPE,RPCSP'
        ]);

        // temporarily store uploaded pdf
        $path = $request->file('pdf')->store('temp');
        $fullpath = storage_path("app/{$path}");
        $mode = strtoupper($request->input('mode'));

        // verify file was stored
        if(!file_exists($fullPath))
        {
            throw new \Exception('Failed to store the PDF file.');
        }

        // hold file path of the python script
        $scriptPath = base_path('python/parse_pdf.py');

        // verify if python script exists
        if(!file_exists($scriptPath))
        {
            throw new \Exception('Python script not found.');
        }

        $python = $this->getPythonExecutable();
        $process = new Process([$python, $scriptPath, $fullPath, $mode]);
        // ensure responsiveness
        $process->setTimeout(300); // 5 minutes timeout

        Log::info('Starting PDF parsing process',[
            'file' => $fullPath,
            'mode' => $mode,
            'command' => $process->getCommandLine()
        ]);

        // run the process
        $process->mustRun();
        $output = $process->getOutput();
        $errorOutput = $process->getErrorOutput();

        // log any error output
        if(!empty($errorOutput))
        {
            Log::warning('Python script error/warning', ['stderr' => $errorOutput]);
        }

        Log::info('Python scrupt completed', [
            'output_length' => strlen($output),
            'exit_code' => $process->getExitCode()
        ]);

        // clean up temporary file
        Storage::delete($path);

        // validate decode json output
        if(empty($output))
        {
            throw new \Exception('Python script returned empty output.');
        }

        // decode and return json output into php array
        $parsed json_decode($output, true);
        
        if(json_last_error() !== JSON_ERROR_NONE)
        {
            throw new \Exception('Invalid JSON output from Python script: ' . json_last_error_msg());
        }

        if($parsed === null)
        {
            throw new \Exception('Python script returned null output.');
        }

        return response()->json([
            'success' => true,
            'data' => $parsed
        ], 200);

        }catch (\Exception $e) 
        {
            Log::error('PDF parsing error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // clean up temporary file if exists
            if(isset($path))
            {
                Storage::delete($path);
            }

            return response()->json([
                'success' => false,
                'error' => 'PDF parsing failed',
                'message' => $e->getMessage()
            ], 500);
        }
        
        // this function returns the python executable name based on the OS
        
        private function getPythonExecutable(): string 
        {
            $python = strtoupper(substr(PHP_OS, 0, 3)) === 'WIN' ? 'python' : 'python3';

            // You could also check if python executable exists
            // exec("which {$python}", $output, $returnCode);
            // if ($returnCode !== 0) {
            //     throw new \Exception("Python executable '{$python}' not found");
            // }

            return $python;
        }
        
    }
}
