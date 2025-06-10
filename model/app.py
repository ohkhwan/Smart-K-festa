
from flask import Flask, request, jsonify
import logging
import traceback
# predict_visitors 모듈에서 predict_festival_outcome 함수를 임포트합니다.
# 이 파일(app.py)과 predict_visitors.py가 동일한 디렉토리 (model/)에 있다고 가정합니다.
from predict_visitors import predict_festival_outcome, excel_df, model, preprocessor, pca_transformer, address_freq_maps

app = Flask(__name__)

# 로깅 설정
if __name__ != '__main__': # Gunicorn 등 프로덕션 서버에서 실행될 때
    gunicorn_logger = logging.getLogger('gunicorn.error')
    app.logger.handlers = gunicorn_logger.handlers
    app.logger.setLevel(gunicorn_logger.level)

# 모델 및 데이터 파일 로드 상태 확인 (선택적)
# predict_visitors.py에서 로드 시점에 예외를 발생시키므로,
# Flask 앱이 성공적으로 시작되면 파일들이 로드된 것으로 간주할 수 있습니다.
# 만약 로드 실패 시 Flask 앱 자체가 시작되지 않습니다.
# 여기서 추가적인 확인을 할 수도 있습니다.
app.logger.info("Flask App: Checking if model and data files were loaded by predict_visitors.py...")
if excel_df is None or model is None or preprocessor is None or pca_transformer is None or address_freq_maps is None:
    app.logger.error("Flask App: One or more model/data files failed to load in predict_visitors.py. API will not function correctly.")
    # 이 경우, /predict 요청 시 오류가 발생하거나, 미리 /health 엔드포인트를 만들어 상태를 확인할 수 있습니다.
else:
    app.logger.info("Flask App: Model and data files seem to be loaded successfully by predict_visitors.py.")


@app.route('/predict', methods=['POST'])
def predict():
    try:
        input_data = request.get_json()
        app.logger.info(f"Received data for prediction: {input_data}")

        # 입력 데이터 유효성 검사
        required_keys = ['광역자치단체', '기초자치단체 시/군/구', '읍/면/동', '축제 시작일', '축제 종류', '예산']
        missing_keys = [key for key in required_keys if key not in input_data or input_data[key] is None]

        if missing_keys:
            app.logger.error(f"Missing required keys: {missing_keys}")
            return jsonify({"error": f"필수 입력값이 누락되었습니다: {', '.join(missing_keys)}"}), 400

        si_param = input_data['광역자치단체']
        gungu_param = input_data['기초자치단체 시/군/구']
        dong_param = input_data['읍/면/동']
        festival_date_param = input_data['축제 시작일'] # YYYY-MM-DD
        festival_type_param = input_data['축제 종류']
        budget_param = input_data['예산'] # 백만원 단위 float

        # 예산 타입 검사 (숫자인지)
        if not isinstance(budget_param, (int, float)):
            try:
                budget_param = float(budget_param)
            except ValueError:
                app.logger.error(f"Invalid budget format: {budget_param}")
                return jsonify({"error": "예산은 숫자 형태여야 합니다."}), 400
        
        app.logger.info("Calling predict_festival_outcome...")
        predicted_visitors_raw = predict_festival_outcome(
            si_param,
            gungu_param,
            dong_param,
            festival_date_param,
            festival_type_param,
            budget_param
        )
        app.logger.info(f"Raw prediction from model: {predicted_visitors_raw}")

        if predicted_visitors_raw == -1: # predict_festival_outcome에서 오류 발생 시 -1 반환 가정
             app.logger.error("Prediction function returned an error code (-1).")
             return jsonify({"error": "모델 예측 중 내부 오류가 발생했습니다."}), 500

        # 예측 결과가 음수일 경우 0으로 처리 (모델 내부에서 이미 처리하지만, 안전장치)
        predicted_visitors = round(max(0, predicted_visitors_raw))
        
        app.logger.info(f"Final rounded prediction: {predicted_visitors}")
        return jsonify({"predicted_visitors": predicted_visitors})

    except Exception as e:
        app.logger.error(f"Error during prediction: {e}")
        app.logger.error(traceback.format_exc())
        return jsonify({"error": f"API 처리 중 오류 발생: {str(e)}"}), 500

@app.route('/health', methods=['GET'])
def health_check():
    # 간단한 상태 확인용 엔드포인트
    # 여기에 모델 로드 상태 등을 더 자세히 확인할 수 있습니다.
    return jsonify({"status": "healthy"}), 200

if __name__ == '__main__':
    # 개발용 서버 실행. 프로덕션에서는 Gunicorn 등을 사용합니다.
    app.logger.setLevel(logging.INFO) # 개발 시 상세 로깅
    app.run(host='0.0.0.0', port=5000, debug=True)

    