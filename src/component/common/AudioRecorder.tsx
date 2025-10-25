import React, { useState, useRef } from "react";

// MediaRecorderとStreamの参照を保持するための型
type MediaRecorderRef = React.MutableRefObject<MediaRecorder | null>;
type MediaStreamRef = React.MutableRefObject<MediaStream | null>;

type AudioRecorderProps = {
  OnChange: (args: string) => void;
};

/**
 * 音声録音とAPI送信を行うコンポーネント
 */
const AudioRecorder = (props: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef: MediaRecorderRef = useRef(null);
  const mediaStreamRef: MediaStreamRef = useRef(null);
  const audioChunksRef = useRef<Blob[]>([]);
  // 1. 録音を開始する関数
  const startRecording = async () => {
    if (isRecording) return;

    try {
      // マイクへのアクセス許可を取得
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = []; // チャンクをリセット

      mediaRecorder.ondataavailable = (event) => {
        // 録音データ（チャンク）が利用可能になったら配列に追加
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        // 録音が停止したら、チャンクを結合してBlobを作成
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
      };

      mediaRecorder.start(); // 録音開始
      setIsRecording(true);
      setAudioBlob(null); // 新規録音開始時に古いBlobをクリア
      console.log("録音を開始しました。");
    } catch (err) {
      console.error("マイクへのアクセスに失敗しました:", err);
      alert("マイクへのアクセスが必要です。");
    }
  };

  // 2. 録音を停止する関数
  const stopRecording = () => {
    if (!isRecording || !mediaRecorderRef.current || !mediaStreamRef.current)
      return;

    // 録音を停止 (onstopイベントが発火し、Blobが生成される)
    mediaRecorderRef.current.stop();

    // マイクの使用を停止
    mediaStreamRef.current.getTracks().forEach((track) => track.stop());

    setIsRecording(false);
    console.log("録音を停止しました。");
  };

  // 3. 録音データをAPIにPOST送信する関数
  const sendAudio = async () => {
    if (!audioBlob) {
      alert("録音データがありません。");
      return;
    }

    const API_ENDPOINT = "https://convert-audio-64fgxin3kq-uc.a.run.app"; // 実際のエンドポイントに置き換えてください
    const formData = new FormData();

    // サーバーが期待するキーとファイル名でBlobを追加
    formData.append("audio_file", audioBlob, `recording-${Date.now()}.webm`);

    try {
      console.log("APIにデータを送信中...");
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        body: formData, // FormDataを使用するとContent-Type: multipart/form-dataが自動設定されます
      });

      if (response.ok) {
        const result = await response.json();
        console.log("送信成功:", result.message);
        props.OnChange(
          result.transcription ??
            "音声入力は失敗しました、もう一度お試し下さい。"
        );
        if (result.transcription) {
          alert("音声データを正常に送信しました！");
        } else {
          alert(`送信に失敗しました: ${response.statusText}`);
        }

        // 成功後の状態リセット
        setAudioBlob(null);
      } else {
        console.error("送信エラー:", response.status, response.statusText);
        alert(`送信に失敗しました: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Fetchエラー:", error);
      alert("ネットワークエラーにより送信に失敗しました。");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        maxWidth: "300px",
      }}
    >
      <h3>🎤 音声録音＆送信</h3>

      {/* 録音ボタン */}
      <button
        onClick={startRecording}
        disabled={isRecording}
        style={{
          padding: "10px",
          backgroundColor: isRecording ? "#ccc" : "green",
          color: "white",
        }}
      >
        {isRecording ? "録音中..." : "🔴 録音開始"}
      </button>

      {/* 停止ボタン */}
      <button
        onClick={stopRecording}
        disabled={!isRecording}
        style={{
          padding: "10px",
          backgroundColor: isRecording ? "red" : "#ccc",
          color: "white",
        }}
      >
        ■ 録音停止
      </button>

      {/* 録音データの状態表示と再生 */}
      {audioBlob && (
        <>
          <p>✅ 録音完了。サイズ: {(audioBlob.size / 1024).toFixed(2)} KB</p>
          <audio
            controls
            src={URL.createObjectURL(audioBlob)}
            style={{ width: "100%" }}
          />

          {/* 送信ボタン */}
          <button
            onClick={sendAudio}
            style={{ padding: "10px", backgroundColor: "blue", color: "white" }}
          >
            ⬆️ 録音データをAPIに送信
          </button>
        </>
      )}

      {!isRecording && !audioBlob && (
        <p>ボタンを押して録音を開始してください。</p>
      )}
    </div>
  );
};

export default AudioRecorder;
