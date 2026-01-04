import React, { useState, useCallback } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Paper,
  Alert,
  Snackbar,
  FormControlLabel,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  Container,
  TextField,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import { useDropzone } from "react-dropzone";
import AudioRecorder from "../component/common/AudioRecorder";

// APIからのレスポンスの型を定義
interface ApiResponse {
  reply: string;
  success: boolean;
}

const API_ENDPOINT = "https://chat-with-openai-64fgxin3kq-uc.a.run.app"; // あなたのFirebase FunctionsのURLに置き換えてください
interface TextChatProps {
  onChange: (csvStr: string) => void;
  onSyncCatchCopy: (catchCopy: string) => void;
}

// 近未来的な接続ラインコンポーネント
const FlowConnector = () => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      my: 2,
    }}
  >
    <Box
      sx={{
        width: "6px",
        height: "30px",
        borderRadius: "10px",
        background:
          "linear-gradient(180deg, #FF9A9E 0%, #FECFEF 99%, #FECFEF 100%)",
        boxShadow: "0 2px 10px rgba(255, 154, 158, 0.5)",
      }}
    />
  </Box>
);

const TextChat: React.FC<TextChatProps> = (props: TextChatProps) => {
  const inputText = `1.短く直感的（8～15文字）
2.友達に話したくなる／笑える／驚く要素を1つ入れる
3.ワクワク・ドキドキ感のある動詞を使う（例：「ひらく」「とぶ」「でてくる」）
4.想像をふくらませる曖昧さを入れる（例：「その先には…!?」）
5.流行ワードや小学生らしい言い回しも可（例：やばい、神、マジ）
6.長すぎ、説明的すぎ、漢字多すぎはNG`;
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [createTextMode, setCreateTextMode] = useState<string>("Audio");

  //CSV関連
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [csvStr, setCsvStr] = useState<string>("");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // 複数ファイルがドロップされた場合でも最初の1つだけを処理
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        setSelectedFile(file);
        setCsvStr(""); // 新しいファイルが選択されたら以前のAPIレスポンスをクリア

        //プロンプト抽出
        // FileReaderインスタンスを作成
        const reader = new FileReader();

        // ファイル読み込みが完了したときのイベントハンドラ
        reader.onload = (event: ProgressEvent<FileReader>) => {
          // ファイルの内容（文字列）を取得し、stateにセット
          const result = event.target?.result as string;
          setCsvStr(result);
          //ほかのコンポーネントに共有可能
          props.onChange(result);
        };

        // ファイルをテキストとして読み込む
        reader.readAsText(file, "Shift_JIS");
      } else {
        setCsvStr("CSVファイルのみアップロード可能です。");
        setSnackbarOpen(true);
      }
    }
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
  const handleSnackbarClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    console.log(event);
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  /*   const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(event.target.value);
  }; */

  const handleSend = async () => {
    setIsLoading(true);
    setApiResponse(null);
    const prompt = `あなたは「小学生に刺さるPOPコピー＆デザインを作るプロフェッショナルでキャッチコピーの専門家」です。
以下の条件を必ず遵守してください。
・作成したキャッチコピーを**番号を用いず必ず「・」で区切って箇条書きで一つに繋げて**ください。
・提供する「本を読んだ方々の感想」をもとに、「キャッチコピー」を10個ほど創作してください。

以下の条件はその次に優先してください。
コピー作成ルール:${encodeURIComponent(inputText)}

以下は本を読んだ方々の感想です参考にしてください。
感想:${csvStr}`;
    try {
      // fetch APIでGETリクエストを送信
      const response = await fetch(`${API_ENDPOINT}?prompt=${prompt}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // If your API requires an Authorization header, add it here.
          // 'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error("API request failed with status: " + response.status);
      }

      const data: ApiResponse = await response.json();
      console.log(data);
      setApiResponse(data);
      // ここで必ず向こうのコンポーネントに共有する
      props.onSyncCatchCopy(data.reply);
    } catch (error) {
      console.error("API call failed:", error);
      // ① まず、errorがErrorオブジェクトのインスタンスであるかを確認
      if (error instanceof Error) {
        // ② Error型として扱えるため、.messageに安全にアクセスできる
        const data = { reply: error.message, success: false };
        setApiResponse(data);
      } else {
        // ③ Errorオブジェクトではない場合
        const data = {
          reply: "予期せぬエラーが発生しました。",
          success: false,
        };
        setApiResponse(data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        p: 4,
        minWidth: 600,
        margin: "0 auto",
      }}
    >
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{
          fontWeight: "bold",
          color: "#E65100",
          textAlign: "center",
          letterSpacing: "0.05em",
          textShadow: "2px 2px 0px rgba(0,0,0,0.05)",
        }}
      >
        キャッチコピー生成コーナー
      </Typography>

      {/* テキストボックス */}
      {/*       <TextField
        label="コピー作成ルール"
        variant="outlined"
        fullWidth
        multiline
        rows={4}
        value={inputText}
        onChange={handleInputChange}
      /> */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: "16px",
          textAlign: "start",
          border: "3px solid #FFCC80",
          backgroundColor: "#fff",
        }}
      >
        <FormControl>
          <FormLabel id="create-text--radio-buttons-group-label">
            入力モード切替
          </FormLabel>
          <RadioGroup
            aria-labelledby="create-text-radio-buttons-group-label"
            defaultValue="Audio"
            name="radio-buttons-group"
            onChange={(_, checked) => {
              setCreateTextMode(checked);
            }}
          >
            <Container>
              <FormControlLabel
                value="Audio"
                control={<Radio />}
                label="録音モード"
              />
              <FormControlLabel
                value="Text"
                control={<Radio />}
                label="テキストモード"
              />
              <FormControlLabel
                value="Csv"
                control={<Radio />}
                label="CSVモード"
              />
            </Container>
          </RadioGroup>
        </FormControl>
        {createTextMode == "Csv" && (
          <Box style={{ width: "50%" }}>
            {/* ファイルドロップゾーン */}
            <Box
              {...getRootProps()}
              sx={{
                border: "3px dashed",
                borderColor: isDragActive
                  ? "#FF4081"
                  : "#D7CCC8",
                borderRadius: "16px",
                p: 4,
                mb: 3,
                backgroundColor: isDragActive
                  ? "#FCE4EC"
                  : "#FFF8E1",
                transition: "all 0.3s ease-in-out",
                cursor: "pointer",
                "&:hover": {
                  borderColor: "#FF4081",
                  backgroundColor: "#F8BBD0",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                },
              }}
            >
              <input {...getInputProps()} />
              <CloudUploadIcon
                sx={{
                  fontSize: 60,
                  color: isDragActive ? "#FF4081" : "#A1887F",
                  mb: 1,
                }}
              />
              {isDragActive ? (
                <Typography variant="h6" sx={{ color: "#FF4081", fontWeight: "bold" }}>
                  ここにファイルをドロップしてください...
                </Typography>
              ) : (
                <Typography variant="h6" color="text.secondary">
                  ファイルをドラッグ＆ドロップするか、クリックして選択
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary">
                （.csv 形式のみ）
              </Typography>
            </Box>
            {/* 選択されたファイル表示 */}
            {selectedFile && (
              <Box
                sx={{
                  mb: 3,
                  p: 2,
                  border: "2px solid",
                  borderColor: "#FFB74D",
                  borderRadius: "12px",
                  backgroundColor: "#FFF3E0",
                }}
              >
                <Typography
                  variant="subtitle1"
                  component="p"
                  sx={{ fontWeight: "bold", color: "#5D4037" }}
                >
                  選択されたファイル:{" "}
                  <span style={{ color: "#D84315", fontWeight: "bold" }}>
                    {selectedFile.name}
                  </span>{" "}
                  ({(selectedFile.size / 1024).toFixed(2)} KB)
                </Typography>
              </Box>
            )}
          </Box>
        )}
        {createTextMode == "Audio" && (
          <Box style={{ width: "100%" }}>
            <AudioRecorder OnChange={setCsvStr} />
          </Box>
        )}
        {createTextMode == "Text" && (
          <Box style={{ width: "100%" }}>
            <TextField
              style={{ width: "100%" }}
              id="outlined-multiline-static"
              label="ここに感想を書いてね"
              multiline
              rows={4}
              value={csvStr}
              onChange={(value) => {
                setCsvStr(value.target.value);
              }}
            />
          </Box>
        )}
      </Paper>
      <FlowConnector />
      {/* プロンプト */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: "16px",
          border: "3px solid #FFF59D",
          backgroundColor: "#FFFFF0",
          textAlign: "start",
          height: "-webkit-fill-available",
        }}
      >
        <span>・感想を読み込んだ結果↓</span>
        <br />
        {csvStr == "" ? null : csvStr}
      </Paper>
      <FlowConnector />
      <Paper
        sx={{
          p: 4,
          borderRadius: "16px",
          border: "3px solid #FFCC80",
          textAlign: "center",
        }}
        elevation={0}
      >
        <span>読みこんだらボタンが表示されるよ</span>
        <br />
        {/* 送信ボタン */}
        {csvStr && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSend}
            disabled={isLoading || !inputText}
            size="large"
            sx={{
              mt: 2,
              borderRadius: "50px",
              backgroundColor: "#FF4081",
              fontWeight: "bold",
              px: 5,
              py: 1.5,
              boxShadow: "0 4px 14px 0 rgba(33, 150, 243, 0.3)",
            }}
            startIcon={
              isLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <SendIcon />
              )
            }
          >
            キャッチコピー案作成
          </Button>
        )}
      </Paper>
      <FlowConnector />
      {/* APIレスポンス表示（Snackbarで通知） */}
      {csvStr != "" && (
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleSnackbarClose}
            severity={"success"}
            sx={{ width: "100%" }}
          >
            {"ファイルをロードました。"}
          </Alert>
        </Snackbar>
      )}

      {/* 問い合わせ結果表示エリア */}
      <Box sx={{ mt: 3 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: "24px",
            textAlign: "start",
            backgroundColor: "#FFFFFF",
            border: "4px solid #FFCC80",
            boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
          }}
        >
          {isLoading && <CircularProgress />}
          {!apiResponse?.success && apiResponse?.reply && (
            <Typography color="error" variant="body1">
              エラー: {apiResponse?.reply}
            </Typography>
          )}
          {apiResponse && (
            <Typography sx={{ maxWidth: 600, color: "#5D4037" }} variant="body1">
              【コピーの生成案】
              <br />
              <span style={{ wordBreak: "break-all" }}>
                {apiResponse.reply}
              </span>
            </Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default TextChat;
