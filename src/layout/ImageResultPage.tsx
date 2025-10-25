import { useState, useEffect } from "react";

// 自作APIのエンドポイントURLを定義
const API_URL = "https://get-image-64fgxin3kq-uc.a.run.app"; // 👈 ここを実際のURLに置き換えてください

interface ImageResultPageProps {
  // 必要に応じて、画像IDなどをプロパティとして受け取る
  imageName?: string;
}

const ImageResultPage = (props: ImageResultPageProps) => {
  const [dataUri, setDataUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchBase64Image = async () => {
      setIsLoading(true);

      try {
        const response = await fetch(
          `${API_URL}?image_name=${props.imageName}`
        );
        console.log(response);

        if (!response.ok) {
          throw new Error("画像の取得に失敗しました。");
        }

        // 1. JSONレスポンスを取得
        const data = await response.json();
        console.log(data);

        // 2. Base64文字列からデータURIを構築
        // 形式: "data:[MIME Type];base64,[Base64文字列]"
        const uri = `data:${data.mimeType};base64,${data.base64Image}`;
        console.log(uri);

        setDataUri(uri);
      } catch (error) {
        console.error("Base64画像取得エラー:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBase64Image();
  });

  if (isLoading) return <p>画像を読み込み中...</p>;
  if (!dataUri) return <p>画像がありません。</p>;

  // 3. <img>タグのsrcに直接データURIを設定
  return (
    <img
      src={dataUri}
      alt="Base64から表示された画像"
      style={{ maxWidth: "100%" }}
    />
  );
};

export default ImageResultPage;
