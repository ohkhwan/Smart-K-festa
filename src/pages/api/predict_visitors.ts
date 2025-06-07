// src/pages/api/predict-visitors.ts // This file should be located at src/app/api/predict-visitors/route.ts if using App Router
import type { NextApiRequest, NextApiResponse } from 'next';
import { spawn } from 'child_process';
import path from 'path';
//import type { PredictionApiPayload } from '@/app/schemas'; // schemas.ts 경로에 맞게 수정
import type { PredictionApiPayload } from '../../app/schemas'; // app 폴더 기준 상대 경로 또는 절대 경로 별칭 사용

// Python 스크립트가 반환할 것으로 예상되는 JSON 구조
interface PythonPredictionOutput {
  predicted_visitors: number;
  // Python 스크립트가 다른 값을 반환한다면 여기에 추가
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const inputData: PredictionApiPayload = req.body;

  // 간단한 입력 데이터 유효성 검사 (필요에 따라 추가)
  if (!inputData['광역자치단체'] || !inputData['기초자치단체 시/군/구'] || !inputData['읍/면/동'] || !inputData['축제 시작일'] || !inputData['축제 종류'] || inputData['예산'] === undefined) {
    return res.status(400).json({ success: false, message: '필수 입력 데이터가 누락되었습니다.' });
  }

  const modelDir = path.resolve(process.cwd(), 'model');
  const pythonScriptPath = path.join(modelDir, 'predict_visitors.py');

  try {
    const pythonProcess = spawn(
      process.env.PYTHON_PATH || 'python',
      [pythonScriptPath],
      { cwd: modelDir }
    );

    let stdoutData = '';
    let stderrData = '';

    pythonProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
      console.error(`Python stderr: ${data.toString()}`); // 서버 콘솔에 Python 에러 출력
    });

    pythonProcess.stdin.write(JSON.stringify(inputData));
    pythonProcess.stdin.end();

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const output: PythonPredictionOutput = JSON.parse(stdoutData);
          if (output && typeof output.predicted_visitors === 'number') {
            console.log("@@@@ 1")
            return res.status(200).json({ success: true, predictedVisitors: output.predicted_visitors });
          } else {
            console.log("@@@@ 2")
            console.error('Parsed Python output is invalid:', output, stdoutData);
            return res.status(500).json({ success: false, message: 'Python 스크립트에서 유효하지 않은 응답을 반환했습니다.' });
          }
        } catch (e) {
          console.log("@@@@ 3")
          console.error('Python 스크립트 출력 파싱 실패:', e, stdoutData, stderrData);
          return res.status(500).json({ success: false, message: 'Python 스크립트 출력 파싱에 실패했습니다.' });
        }
      } else {
        console.log("@@@@ 4")
        console.error(`Python 스크립트 종료 코드 ${code}`);
        console.error('Python stdout raw:', stdoutData);
        console.error('Python stderr raw:', stderrData);
        return res.status(500).json({ success: false, message: `예측 실패. Python 스크립트 오류: ${stderrData || '알 수 없는 오류'}` });
      }
    });

    pythonProcess.on('error', (err) => {
      console.log("@@@@ 5")
      console.error('Python 프로세스 시작 실패:', err);
      return res.status(500).json({ success: false, message: 'Python 프로세스를 시작할 수 없습니다.' });
    });

  } catch (error) {
    console.log("@@@@ 6")
    console.error('API Route Error:', error);
    return res.status(500).json({ success: false, message: 'API 라우트 처리 중 오류가 발생했습니다.' });
  }
}