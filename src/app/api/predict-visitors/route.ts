import { NextResponse, type NextRequest } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import { type PredictionApiPayload } from '@/app/schemas'; // 스키마 경로 확인 필요

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as PredictionApiPayload;

    console.log("@@@@ 1")
    // 필수 입력값 기본 검증
    if (!body['광역자치단체'] || !body['기초자치단체 시/군/구'] || !body['읍/면/동'] || !body['축제 시작일'] || !body['축제 종류'] || body['예산'] === undefined) {
      return NextResponse.json({ error: '필수 입력 데이터가 누락되었습니다.' }, { status: 400 });
    }

    const pythonScriptPath = path.join(process.cwd(), 'model', 'predict_visitors.py');
    // 시스템에 따라 'python' 또는 'python3' 사용
    const pythonExecutable = process.env.PYTHON_EXECUTABLE || 'python'; 

    const scriptPayload = JSON.stringify(body);

    // Python 스크립트에 전달될 데이터 로깅 (디버깅용)
    console.log("Sending to Python script:", scriptPayload);

    // Python 스크립트 실행. 'cwd' 설정으로 스크립트 내 상대 경로 파일(모델, 엑셀 등) 로드 보장
    const pythonProcess = spawn(pythonExecutable, [pythonScriptPath], {
        cwd: path.join(process.cwd(), 'model') 
    });

    let scriptOutput = '';
    let scriptError = '';

    pythonProcess.stdin.write(scriptPayload);
    pythonProcess.stdin.end();

    pythonProcess.stdout.on('data', (data) => {
      scriptOutput += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      const errData = data.toString();
      scriptError += errData;
      // Python 스크립트의 stderr 출력을 서버 콘솔에 로깅 (디버깅에 유용)
      console.error(`Python script stderr: ${errData}`);
    });

    const exitCode = await new Promise<number | null>((resolve, reject) => {
      pythonProcess.on('close', (code) => {
        resolve(code);
      });
      pythonProcess.on('error', (err) => {
        console.error('Failed to start Python subprocess.', err);
        reject(err); // Python 프로세스 시작 자체에 실패한 경우
      });
    });

    if (exitCode !== 0) {
      console.error(`Python script exited with code ${exitCode}. Error: ${scriptError}`);
      return NextResponse.json({ error: `Python 스크립트 실행 오류 (코드: ${exitCode}): ${scriptError || '알 수 없는 오류'}` }, { status: 500 });
    }

    // Python 스크립트가 정상 종료(exitCode 0)했으나, stderr에 내용이 있고 stdout이 비어있다면 오류로 간주
    if (scriptError && !scriptOutput.trim() && exitCode === 0) {
        console.warn(`Python script exited successfully but produced stderr output without stdout: ${scriptError}`);
        // 이 경우, scriptError 내용을 오류 메시지로 사용할 수 있으나, 상황에 따라 다를 수 있음
    }

    try {
      const predictionResult = JSON.parse(scriptOutput);
      // Python 스크립트는 {"predicted_visitors": 숫자} 형태의 JSON을 반환
      if (predictionResult && typeof predictionResult.predicted_visitors === 'number') {
        return NextResponse.json({
            congestionForecast: { // 프론트엔드 CongestionForecastResults 구조에 맞춤
                totalExpectedVisitors: predictionResult.predicted_visitors
            }
        });
      } else {
        console.error('Python script output format unexpected:', scriptOutput);
        return NextResponse.json({ error: 'Python 스크립트로부터 유효한 예측 결과를 받지 못했습니다.' }, { status: 500 });
      }
    } catch (e) {
      console.error('Error parsing Python script output:', e, "\nOutput was:", scriptOutput, "\nError was:", scriptError);
      return NextResponse.json({ error: `Python 스크립트 결과 파싱 오류: ${scriptError || scriptOutput}` }, { status: 500 });
    }

  } catch (error) {
    console.error('API Route Error:', error);
    if (error instanceof SyntaxError) { // 요청 body의 JSON 파싱 오류
        return NextResponse.json({ error: '잘못된 요청 데이터 형식입니다.' }, { status: 400 });
    }
    return NextResponse.json({ error: '내부 서버 오류가 발생했습니다.' }, { status: 500 });
  }
}