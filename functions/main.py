import base64
import datetime
import json
import mimetypes
import os
import io
import csv
from firebase_admin import initialize_app, storage
from firebase_functions import https_fn
from firebase_functions.options import set_global_options
from httpx import stream
from openai import OpenAI
from flask import Flask, jsonify, send_file
from flask_cors import CORS
from firebase_functions import params
from werkzeug.datastructures import FileStorage
from werkzeug.formparser import parse_form_data
from google.cloud import speech

app = Flask(__name__)

# すべてのオリジンを許可する場合（開発環境向け）
CORS(app, origins="*")

# --- Firebase Admin SDKの初期化 ---
# Cloud Functions環境では、引数なしで初期化すると
# 自動的にプロジェクトの認証情報が使われます。
initialize_app()

# 関数のグローバルオプションを設定（例：最大インスタンス数）
set_global_options(max_instances=10)

# SecretParam オブジェクトは関数の外で定義する
OPENAI_KEY = params.SecretParam('OPENAI_KEY')
GCP_KEY_PATH = params.SecretParam('GCP_KEY_PATH')  # ★ SecretParam を利用

headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '3600',  # プリフライト結果をキャッシュする秒数
    'Content-Type': 'application/json'
}

image_headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '3600',  # プリフライト結果をキャッシュする秒数
}


# --- HTTPトリガーで起動する関数の定義 ---
# @https_fn.on_request()デコレータで関数を登録します
@https_fn.on_request()
def get_image(req: https_fn.Request) -> https_fn.Response:
    """
    Firebase Storageから指定した名称の画像のダウンロードURLを取得します。

    Args:
        image_name (str): 取得したい画像のファイル名（例: 'photo.jpg'）。

    Returns:
        str or None: 画像のダウンロードURL。ファイルが存在しない場合はNone。
    """
    try:
        # Storageバケットへの参照を取得
        bucket = storage.bucket()
        image_name = req.args.get('image_name')
        if image_name is None:
            return create_response(jsonify({"message": '"image_name" is nothing'}))

        # 画像のファイルパスを指定してBlob（ファイル）への参照を作成
        # 例: 'images/photo.jpg' のようにフォルダ名を含めることもできます
        blob = bucket.blob(f'votes/images/{image_name}')
        if not blob.exists():
            blob = bucket.blob(f'images/{image_name}')
        # ファイルが存在するか確認
        if not blob.exists():
            print(f"Error: File '{image_name}' not found.")
            return create_response(jsonify({"message": f"Error: File '{image_name}' not found."}))

        # ファイルのMIMEタイプを推測
        mimetype, _ = mimetypes.guess_type(image_name)
        if not mimetype:
            mimetype = 'application/octet-stream'  # 推測できない場合は汎用タイプを使用

        stream_data = blob.download_as_bytes()
        response = send_file(
            io.BytesIO(stream_data),
            mimetype=mimetype,
        )
        response.headers.update(image_headers)
        return response

    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"message": f"An error occurred: {e}"})


@https_fn.on_request()
def hello_world(req: https_fn.Request) -> https_fn.Response:
    # サーバーのログに出力
    print("サーバーテスト: Hello, World リクエストを受信")

    # 成功を示す HTTP ステータスコード200を明示的に返す
    return create_response(jsonify({"message": "Success Test"}))


@https_fn.on_request(timeout_sec=300, secrets=['OPENAI_KEY'])
def generate_and_save_image(req: https_fn.Request) -> https_fn.Response:
    # URLクエリパラメータからプロンプトを取得
    prompt = req.args.get('prompt')
    size = req.args.get('size')
    print('起動')
    print(prompt)
    if not prompt:
        return create_response(jsonify({"message": "promptがありません"}))

    # Storageバケットへの参照を取得
    bucket = storage.bucket()

    try:
        # 実際の値（文字列）の取得とclientの初期化は、関数の内側で行う
        api_key_value = OPENAI_KEY.value
        client = OpenAI(api_key=api_key_value)

        # OpenAI gpt-image-1 APIを呼び出し
        response = client.images.generate(
            model="gpt-image-1",  # ←ここを変更
            prompt=prompt,
            size=size,
        )

        # base64エンコードされた画像データを取得し、バイトデータにデコード
        image_data = response.data[0].b64_json
        image_bytes = base64.b64decode(image_data)

        # ファイル名を生成（タイムスタンプとハッシュを含めることで重複を避ける）
        timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
        import hashlib
        prompt_hash = hashlib.sha256(prompt.encode()).hexdigest()[:8]
        file_name = f"image_{timestamp}_{prompt_hash}.png"
        blob = bucket.blob(f"images/{file_name}")

        # Storageに画像をアップロード
        blob.upload_from_string(image_bytes, content_type='image/png')

        response_message = f'画像 "{file_name}" を正常に生成・アップロードしました。'
        print(response_message)

        return create_response(jsonify({
            "message": "成功しました！",
            "image_path": file_name,
        }))

    except Exception as e:
        error_message = f'エラー: 画像の生成またはアップロードに失敗しました - {str(e)}'
        print(error_message)
        return create_response(jsonify({"message": error_message}))


@https_fn.on_request(timeout_sec=300, secrets=['OPENAI_KEY'])
def chat_with_openai(req: https_fn.Request) -> https_fn.Response:
    try:
        # Get the user's message from the request
        prompt = req.args.get("prompt")
        if not prompt:
            return create_response(jsonify({"error": "Prompt is missing."}))
        # 実際の値（文字列）の取得とclientの初期化は、関数の内側で行う
        api_key_value = OPENAI_KEY.value
        client = OpenAI(api_key=api_key_value)
        # Create a conversation with a single user message
        chat_completion = client.chat.completions.create(
            messages=[
                # 以下のように、`role`と`content`を明確に指定する
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            model="gpt-4o",
            timeout=180.0
        )

        # Extract the assistant's reply
        reply = chat_completion.choices[0].message.content

        return create_response(jsonify({"success": True, "reply": reply}))

    except Exception as e:
        return create_response(jsonify({"error": str(e)}))


@https_fn.on_request(timeout_sec=300)
def vote_counter(req: https_fn.Request) -> https_fn.Response:
    """
    Firebase StorageのJSONファイルに投票数を記録します。
    投票対象の画像が存在するか確認してから投票処理を行います。
    """
    try:
        # リクエストから投票項目を取得
        voted_item = req.args.get('item')
        if voted_item is None:
            return create_response(jsonify({"message": '"item" is missing'}))

        # Storageバケットへの参照を取得
        bucket = storage.bucket()

        # 投票対象の画像blobの存在チェック
        image_path = f'votes/images/{voted_item}'
        image_blob = bucket.blob(image_path)
        if not image_blob.exists():
            return create_response(jsonify({"message": f'Voted item image "{voted_item}" not found.'}))

        # JSONファイル名とパス
        file_name = 'vote_counts.json'
        file_path = f'votes/{file_name}'
        blob = bucket.blob(file_path)

        # ストレージから現在の投票データを取得
        try:
            # ファイルが存在する場合
            file_data = blob.download_as_text()
            vote_data = json.loads(file_data)
        except Exception:
            # ファイルが存在しない場合
            vote_data = {}

        # 投票数をインクリメント
        vote_data[voted_item] = vote_data.get(voted_item, 0) + 1

        # 更新されたデータをJSON形式で保存
        blob.upload_from_string(json.dumps(vote_data, indent=4), content_type='application/json')

        # 成功レスポンスを返す
        response = {
            'message': f'"{voted_item}"に投票しました。 現在：{vote_data.get(voted_item)}票',
            'current_counts': vote_data
        }
        return create_response(jsonify(response))

    except Exception as e:
        # 予期せぬエラーが発生した場合
        print(f"Error: {e}")
        return create_response(jsonify({"message": "Error: An unexpected error occurred."}))


@https_fn.on_request(timeout_sec=300)
def get_vote_counts(req: https_fn.Request) -> https_fn.Response:
    """
    Firebase StorageからJSONファイルを読み込み、その内容をJSONレスポンスとして返します。
    """
    try:
        # Storageバケットへの参照を取得
        bucket = storage.bucket()

        # 目的のファイルへの参照を作成
        blob = bucket.blob('votes/vote_counts.json')

        # ファイルが存在するか確認
        if not blob.exists():
            return create_response(jsonify({"message": "File not found"}))
        print('start reading vote_counts.json')
        # ファイルの中身を文字列としてダウンロード
        json_data_str = blob.download_as_string()
        print('start json convert')
        # 文字列をJSONオブジェクトにパース
        vote_counts = json.loads(json_data_str)
        print('end json convert -start')
        print(vote_counts)
        print('end json convert -end')
        # JSONレスポンスを返す
        return create_response(jsonify(vote_counts))

    except Exception as e:
        # エラーが発生した場合、500エラーとして返す
        return create_response(jsonify({"message": "Error:" + str(e)}))


@https_fn.on_request(timeout_sec=300)
def get_vote_targets(req: https_fn.Request) -> https_fn.Response:
    """
    Firebase Storageの 'votes/images/' ディレクトリにある画像のファイル名を取得し、
    ファイル名をキー、値を0としたオブジェクトを返します。
    """
    try:
        # Storageバケットへの参照を取得
        bucket = storage.bucket()

        # 指定されたプレフィックス内のすべてのblob（ファイル）をリストアップ
        # files/a.jpg のようなフルパスで返される
        blobs = bucket.list_blobs(prefix='votes/images/')

        # ファイル名をキー、値を0とするオブジェクトを作成
        # {'a.jpg': 0, 'b.jpg': 0, ...}
        vote_targets = {}
        for blob in blobs:
            # プレフィックス 'votes/images/' を取り除いてファイル名のみを取得
            file_name = blob.name.replace('votes/images/', '')
            # ディレクトリ自体は無視
            if file_name:
                vote_targets[file_name] = 0

        # 作成したオブジェクトをJSONレスポンスとして返す
        return create_response(jsonify(vote_targets))

    except Exception as e:
        # エラーが発生した場合、500エラーとして返す
        return create_response(jsonify({"message": "Error:" + str(e)}))


@https_fn.on_request(timeout_sec=300)
def clear_votes(req: https_fn.Request) -> https_fn.Response:
    """
    Firebase Storageの 'votes/vote_counts.json' を空のJSONファイルでクリアします。
    """
    try:
        # JSONファイル名とパス
        file_name = 'vote_counts.json'
        file_path = f'votes/{file_name}'

        # Storageバケットへの参照を取得
        bucket = storage.bucket()
        blob = bucket.blob(file_path)

        # ファイルを空のJSONオブジェクトで上書き
        blob.upload_from_string(json.dumps({}, indent=4), content_type='application/json')

        # 成功レスポンスを返す
        response = {
            'message': f'"{file_path}" has been cleared.'
        }
        return create_response(jsonify(response))

    except Exception as e:
        # エラーが発生した場合、500エラーとして返す
        print(f"Error: {e}")
        return create_response(jsonify({"message": "Error: An unexpected error occurred."}))


# Functionsが使用するシークレットを定義
# 登録したシークレット名 (SECRET_KEY_STT) を指定
@https_fn.on_request(secrets=["GCP_KEY_PATH"])
def convert_audio(req: https_fn.Request) -> https_fn.Response:
    # Cloud Speech-to-Text APIクライアントを初期化
    speech_client = initialize_speech_client(GCP_KEY_PATH.value)
    print(f'GCP_KEY_PATH: {GCP_KEY_PATH.value}')
    # 認証が成功しているかを確認
    if speech_client is None:
        return https_fn.Response("Error: Speech Client failed to initialize.", status=500)
    print(f'speech_client: {speech_client}')
    # 2. リクエストから音声ファイル（Blob）を抽出
    # クライアントからは multipart/form-data で音声データが送られることを想定
    audio_file = req.files['audio_file']

    if not audio_file:
        return https_fn.Response("Error: 'audio_file' not found in request form data.", status=400)

    print(f'audio_file: {audio_file}')

    # 3. Speech-to-Text APIへのリクエストを構築
    audio_content = audio_file.read()

    # 1. 設定をPythonのdict型で定義
    # 注意: Enum値はそのまま渡すか、文字列として渡す場合は適切な処理が必要です。
    # ここでは、簡潔のためEnum値をそのまま使用します。
    config_dict = {
        "encoding": speech.RecognitionConfig.AudioEncoding.ENCODING_UNSPECIFIED,
        "sample_rate_hertz": 48000,
        "language_code": "ja-JP",
        "model": "default"  # 省略可
    }

    # 2. dictをキーワード引数として展開して、configオブジェクトを作成
    config = speech.RecognitionConfig(**config_dict)

    audio = speech.RecognitionAudio(content=audio_content)
    print(f'audio OK')

    # 4. Speech-to-Text APIの呼び出し (同期処理)
    try:
        response = speech_client.recognize(config=config, audio=audio)
    except Exception as e:
        return create_response(jsonify({"message": f"Speech-to-Text API Error: {e}"}))
    print(f'response: {response}')
    # 5. 結果の抽出と応答の返却
    if response.results:
        # 最も確度の高い結果を取得
        transcription = response.results[0].alternatives[0].transcript
        confidence = response.results[0].alternatives[0].confidence
        print(f'transcription: {transcription}')
        print(f'confidence: {confidence}')
        return create_response(jsonify({
                "transcription": transcription,
                "confidence": confidence,
                "message": "Success"
            }))
    else:
        return create_response(jsonify({"message": f"result None"}))


# Functionsのクライアントを初期化する関数
def initialize_speech_client(KEY_PATH):
    if KEY_PATH:
        # サービス アカウント キーファイルを指定してクライアントを初期化
        # この方法が、キーをコードベースに含める場合の「1の方法」です。
        return speech.SpeechClient.from_service_account_json(KEY_PATH)
    else:
        # 環境変数が設定されていない、またはファイルが存在しない場合は
        # Functionsのデフォルト認証（ADC）を試みる（安全な代替案）
        print("WARN: Service account key path not found, falling back to ADC.")
        return speech.SpeechClient()


def create_response(response):
    response.headers.update(headers)
    return response