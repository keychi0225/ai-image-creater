import { Alert, Button, CircularProgress } from "@mui/material";
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
    <>
      {dataUri && (
        <img
          src={dataUri ?? undefined}
          alt="Base64から表示された画像"
          style={{ maxWidth: "100%" }}
        />
      )}
      {!isLoading && (
        <Button variant="contained" onClick={fetchBase64Image}>
          結果確認ボタン
        </Button>
      )}
      {isLoading && <CircularProgress />}
      {errorMessage && <Alert color="error">{errorMessage}</Alert>}
    </>
  );
};

export default ImageResultPage;
