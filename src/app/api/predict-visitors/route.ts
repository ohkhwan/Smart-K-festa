
import { type NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import type { PredictionApiPayload } from '@/app/schemas';

export async function POST(request: NextRequest): Promise<Response> {
  const pythonExecutable = process.env.PYTHON_EXECUTABLE || 'python3';
  console.log(`Attempting to use Python executable: ${pythonExecutable}`);
  console.log(`Current working directory (from API route): ${process.cwd()}`);
  const modelDir = path.join(process.cwd(), 'model');
  console.log(`Target model directory: ${modelDir}`);

  let body: PredictionApiPayload;
  try {
    body = await request.json();
  } catch (e) {
    const err = e as Error;
    console.error('Error parsing request JSON:', err.message);
    const errorPayload = { error: `Invalid request JSON: ${err.message}` };
    const responseBody = JSON.stringify(errorPayload);
    return new Response(responseBody, {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Detailed input validation
  const requiredFields: (keyof PredictionApiPayload)[] = [
    '광역자치단체',
    '기초자치단체 시/군/구',
    '읍/면/동',
    '축제 시작일',
    '축제 종류',
  ];
  const missingFields = requiredFields.filter(field => !body[field]);
  if (body['예산'] === undefined || body['예산'] === null || (typeof body['예산'] === 'string' && body['예산'].trim() === '')) {
      missingFields.push('예산');
  }


  if (missingFields.length > 0) {
    const errorMessage = `필수 입력 데이터가 누락되었습니다: ${missingFields.join(', ')}`;
    console.error(errorMessage);
    const errorPayload = { error: errorMessage };
    const responseBody = JSON.stringify(errorPayload);
    return new Response(responseBody, {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  const pythonScriptPath = path.join(modelDir, 'predict_visitors.py');
  console.log(`Full path to Python script: ${pythonScriptPath}`);

  return new Promise<Response>((resolve) => {
    const scriptPayload = JSON.stringify(body);
    console.log("Sending to Python script:", scriptPayload);

    const pythonProcess = spawn(pythonExecutable, [pythonScriptPath], {
        cwd: modelDir, // Set working directory for the script
        stdio: ['pipe', 'pipe', 'pipe'], // Ensure stdio is piped
    });

    let scriptOutput = '';
    let scriptError = '';
    let stdoutClosed = false;
    let stderrClosed = false;

    pythonProcess.stdout.on('data', (data) => {
      const chunk = data.toString();
      scriptOutput += chunk;
      console.log(`Python stdout chunk: ${chunk.substring(0, 200)}...`);
    });

    pythonProcess.stderr.on('data', (data) => {
      const chunk = data.toString();
      scriptError += chunk;
      console.error(`Python stderr chunk: ${chunk.substring(0, 200)}...`);
    });
    
    pythonProcess.stdout.on('close', () => {
        stdoutClosed = true;
        console.log("Python stdout stream closed.");
        if (stdoutClosed && stderrClosed) {
            // This check might be redundant if 'close' event handles it
        }
    });

    pythonProcess.stderr.on('close', () => {
        stderrClosed = true;
        console.log("Python stderr stream closed.");
        if (stdoutClosed && stderrClosed) {
            // This check might be redundant if 'close' event handles it
        }
    });

    try {
        pythonProcess.stdin.write(scriptPayload);
        pythonProcess.stdin.end();
        console.log("Successfully wrote to Python stdin and ended.");
    } catch (stdinError: any) {
        const errorMessage = `Error writing to Python stdin: ${stdinError.message}`;
        console.error(errorMessage, stdinError.stack);
        const errorPayload = { error: errorMessage };
        const responseBody = JSON.stringify(errorPayload);
        resolve(new Response(responseBody, {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }));
        return; // Exit promise executor
    }

    pythonProcess.on('close', (code) => {
      console.log(`Python script finished. Exit code: ${code}`);
      console.log(`Final Python stdout: ${scriptOutput.substring(0,1000)}`);
      console.error(`Final Python stderr: ${scriptError.substring(0,1000)}`);

      if (code === 0) {
        if (!scriptOutput.trim()) {
            const errorMessage = 'Python 스크립트가 성공적으로 실행되었으나 출력이 없습니다.';
            console.error(errorMessage);
            if (scriptError.trim()) {
                console.error(`Python stderr had content: ${scriptError.substring(0,500)}`);
            }
            const errorPayload = { error: errorMessage };
            const responseBody = JSON.stringify(errorPayload);
            resolve(new Response(responseBody, {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            }));
            return;
        }
        try {
          const predictionResult = JSON.parse(scriptOutput);
          if (predictionResult && typeof predictionResult.predicted_visitors === 'number') {
            const apiResponse = {
                congestionForecast: {
                    totalExpectedVisitors: predictionResult.predicted_visitors,
                },
            };
            console.log("Python script success, API Response:", apiResponse);
            // For success, NextResponse.json is generally fine
            resolve(NextResponse.json(apiResponse));
          } else {
            const errorMessage = `Python 스크립트 출력 형식 오류. 예상: {"predicted_visitors": number}, 실제: ${scriptOutput.substring(0, 500)}`;
            console.error(errorMessage);
            const errorPayload = { error: errorMessage };
            const responseBody = JSON.stringify(errorPayload);
            resolve(new Response(responseBody, {
              status: 500,
              headers: { 'Content-Type': 'application/json' },
            }));
          }
        } catch (e: any) {
          const errorMessage = `Python 스크립트 출력 JSON 파싱 오류: ${e.message || String(e)}. 출력 (앞 500자): ${scriptOutput.substring(0, 500)}. Stderr (앞 500자): ${scriptError.substring(0, 500)}`;
          console.error(errorMessage);
          const errorPayload = { error: errorMessage };
          const responseBody = JSON.stringify(errorPayload);
          resolve(new Response(responseBody, {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }));
        }
      } else {
        const errorMessage = `Python 스크립트 실행 실패 (종료 코드: ${code}). 에러: ${scriptError.substring(0, 500) || '알 수 없는 오류'}`;
        console.error(errorMessage);
        const errorPayload = { error: errorMessage };
        const responseBody = JSON.stringify(errorPayload);
        resolve(new Response(responseBody, {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }));
      }
    });

    pythonProcess.on('error', (spawnError) => {
      const errorMessage = `Python subprocess failed to start or crashed: ${spawnError.message}`;
      console.error("Python process spawn error:", errorMessage, spawnError.stack);
      const errorPayload = { error: errorMessage };
      const responseBody = JSON.stringify(errorPayload);
      resolve(new Response(responseBody, {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }));
    });
  });
}
