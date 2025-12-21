import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Stack,
} from "@mui/material";
import { Mic, Stop, CloudUpload, Delete } from "@mui/icons-material";
import { keyframes } from "@emotion/react";

// MediaRecorderとStreamの参照を保持するための型
type MediaRecorderRef = React.MutableRefObject<MediaRecorder | null>;
type MediaStreamRef = React.MutableRefObject<MediaStream | null>;

type AudioRecorderProps = {
  OnChange: (args: string) => void;
};

// 録音中のパルスアニメーション
const pulseAnimation = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(255, 0, 85, 0.4);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(255, 0, 85, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 0, 85, 0);
  }
`;

/**
 * 音声録音とAPI送信を行うコンポーネント
 */
const AudioRecorder = (props: AudioRecorderProps) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef: MediaRecorderRef = useRef(null);
  const mediaStreamRef: MediaStreamRef = useRef(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  // 1. 録音を開始する関数
  const startRecording = async () => {
    if (isRecording) return;
    setStatusMessage(null);
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
      setStatusMessage({
        type: "error",
        text: "マイクへのアクセスが必要です。",
      });
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
      setStatusMessage({ type: "error", text: "録音データがありません。" });
      return;
    }

    setIsSending(true);
    setStatusMessage(null);
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
          setStatusMessage({
            type: "success",
            text: "音声データを正常に送信しました！",
          });
        } else {
          setStatusMessage({
            type: "error",
            text: `送信に失敗しました: ${response.statusText}`,
          });
        }

        // 成功後の状態リセット
        setAudioBlob(null);
      } else {
        console.error("送信エラー:", response.status, response.statusText);
        setStatusMessage({
          type: "error",
          text: `送信に失敗しました: ${response.statusText}`,
        });
      }
    } catch (error) {
      console.error("Fetchエラー:", error);
      setStatusMessage({
        type: "error",
        text: "ネットワークエラーにより送信に失敗しました。",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleReset = () => {
    setAudioBlob(null);
    setStatusMessage(null);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        p: 4,
        borderRadius: 2,
        alignItems: "center",
        border: "1px solid rgba(0, 242, 255, 0.2)",
        background: "rgba(10, 14, 23, 0.6)",
      }}
    >
      <Typography variant="h6" sx={{ color: "primary.main" }}>
        🎤 音声録音＆送信
      </Typography>

      <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
        {!isRecording ? (
          <Button
            variant="contained"
            color="error"
            startIcon={<Mic />}
            onClick={startRecording}
            disabled={isSending || !!audioBlob}
            sx={{
              borderRadius: "50px",
              px: 4,
              py: 1.5,
            }}
          >
            録音開始
          </Button>
        ) : (
          <Button
            variant="contained"
            color="secondary"
            startIcon={<Stop />}
            onClick={stopRecording}
            sx={{
              borderRadius: "50px",
              px: 4,
              py: 1.5,
              animation: `${pulseAnimation} 1.5s infinite`,
            }}
          >
            録音停止
          </Button>
        )}
      </Box>

      {isRecording && (
        <Typography variant="body2" color="secondary" sx={{ mt: -1 }}>
          録音中...
        </Typography>
      )}

      {/* 録音データの状態表示と再生 */}
      {audioBlob && (
        <Box sx={{ width: "100%", textAlign: "center" }}>
          <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
            ✅ 録音完了 ({(audioBlob.size / 1024).toFixed(2)} KB)
          </Typography>
          <audio
            controls
            src={URL.createObjectURL(audioBlob)}
            style={{ width: "100%", marginBottom: "16px" }}
          />

          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<Delete />}
              onClick={handleReset}
              disabled={isSending}
            >
              破棄
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={
                isSending ? <CircularProgress size={20} /> : <CloudUpload />
              }
              onClick={sendAudio}
              disabled={isSending}
            >
              {isSending ? "送信中..." : "送信して変換"}
            </Button>
          </Stack>
        </Box>
      )}

      {statusMessage && (
        <Alert severity={statusMessage.type} sx={{ width: "100%" }}>
          {statusMessage.text}
        </Alert>
      )}
    </Paper>
  );
};

export default AudioRecorder;
