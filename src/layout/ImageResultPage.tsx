import {
  Alert,
  Button,
  CircularProgress,
  Box,
  Typography,
  Paper,
} from "@mui/material";
import { useState } from "react";

// 自作APIのエンドポイントURLを定義
const API_URL = "https://get-image-64fgxin3kq-uc.a.run.app"; // 👈 ここを実際のURLに置き換えてください

interface ImageResultPageProps {
  // 必要に応じて、画像IDなどをプロパティとして受け取る
  imageName?: string;
}

const ImageResultPage = (props: ImageResultPageProps) => {
  const [dataUri, setDataUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const fetchBase64Image = async () => {
    console.log(props);
    setIsLoading(true);
    const url = `${API_URL}?image_name=${props.imageName}`;

    try {
      const response = await fetch(url);
      console.log(response);

      if (!response.ok) {
        throw new Error("画像の取得に失敗しました。");
      }

      // 2. バイナリデータをArrayBufferとして取得
      const arrayBuffer = await response.arrayBuffer();

      // 3. Base64データURIに変換
      // Content-TypeヘッダからMIMEタイプを取得（例: 'image/jpeg'）
      const contentType = response.headers.get("Content-Type");
      const base64String = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );
      const dataUri = `data:${contentType};base64,${base64String}`;
      console.log(dataUri);

      setDataUri(dataUri);
    } catch (error) {
      console.error("Base64画像取得エラー:", error);
      setErrorMessage("エラーです。まだ生成されていない可能性があります。");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. <img>タグのsrcに直接データURIを設定
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
      }}
    >
      {!props.imageName ? (
        <Paper
          elevation={0}
          sx={{
            p: 5,
            borderRadius: "24px",
            textAlign: "center",
            border: "3px dashed #FFB74D",
            backgroundColor: "#FFF3E0",
            color: "#5D4037",
          }}
        >
          <Typography variant="h6" color="inherit" gutterBottom sx={{ fontWeight: "bold" }}>
            まだ画像生成が完了していません
          </Typography>
          <Typography variant="body2" color="inherit">
            前のステップに戻って「POPを作成」ボタンを押してください。
          </Typography>
        </Paper>
      ) : (
        <>
          {dataUri && (
            <Paper
              elevation={0}
              sx={{
                p: 1,
                borderRadius: "16px",
                border: "4px solid #FFCC80",
                boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                backgroundColor: "#fff",
                overflow: "hidden",
                maxWidth: "100%",
              }}
            >
              <img
                src={dataUri}
                alt="生成されたPOP画像"
                style={{
                  maxWidth: "100%",
                  display: "block",
                  borderRadius: "4px",
                }}
              />
            </Paper>
          )}
          {!isLoading && !dataUri && props.imageName && (
            <Button
              variant="contained"
              onClick={fetchBase64Image}
              size="large"
              sx={{ borderRadius: "50px", backgroundColor: "#FF4081", fontWeight: "bold", px: 5, py: 1.5 }}
            >
              結果確認ボタン
            </Button>
          )}
          {isLoading && <CircularProgress />}
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
        </>
      )}
    </Box>
  );
};

export default ImageResultPage;
