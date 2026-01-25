import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Dialog,
  IconButton,
  TextField,
  Button,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ImageResultList, {
  type ImageResult,
} from "../component/ImageResultList";

// APIレスポンスの型定義
interface StorageImageResponse {
  contentType: string;
  name: string;
  size: number;
  updated: string;
  url: string;
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

const ImageResultListPage: React.FC = () => {
  // State管理
  const [images, setImages] = useState<ImageResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<ImageResult | null>(null);

  // 認証関連のState
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [authError, setAuthError] = useState<boolean>(false);

  // 画像データを取得する関数
  const fetchImages = async () => {
    setIsLoading(true);
    setImages([]); // 検索開始時にリストをクリア

    try {
      const response = await fetch(
        "https://get-images-from-storage-64fgxin3kq-uc.a.run.app?limit=5&offset=0",
      );

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      const data: StorageImageResponse[] = await response.json();

      // APIレスポンスをImageResult型に変換
      const mappedImages: ImageResult[] = data
        .map((item) => ({
          id: item.name,
          url: item.url,
          thumbnailUrl: item.url, // サムネイル用URLがないため同じものを使用
          title: item.name.split("/").pop() || item.name, // ファイル名をタイトルとして使用
          description: `サイズ: ${(item.size / 1024).toFixed(0)}KB`,
        }))
        .sort((a, b) => b.id.localeCompare(a.id)); // IDで降順ソート

      setImages(mappedImages);
    } catch (error) {
      console.error("画像の取得に失敗しました", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 認証完了時にデータを取得
  useEffect(() => {
    if (isAuthenticated) {
      fetchImages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // 画像クリック時のハンドラ (ImageResultListから呼ばれる)
  const handleImageClick = (image: ImageResult) => {
    setSelectedImage(image);
  };

  // モーダルを閉じるハンドラ
  const closeModal = () => {
    setSelectedImage(null);
  };

  // ログインハンドラ
  const handleLogin = () => {
    if (passwordInput === "bookpop") {
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  // 認証されていない場合はパスワード入力モーダルを表示
  if (!isAuthenticated) {
    return (
      <Box
        sx={{
          width: "100%",
          minHeight: "100vh",
          backgroundColor: "#FFF8E1",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Dialog open={true} disableEscapeKeyDown>
          <DialogTitle>アクセス制限</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }}>
              このページを閲覧するにはパスワードが必要です。
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              id="password"
              label="パスワード"
              type="password"
              fullWidth
              variant="outlined"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              error={authError}
              helperText={authError ? "パスワードが間違っています" : ""}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleLogin();
                }
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleLogin} variant="contained" color="primary">
              認証
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        p: 4,
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#FFF8E1",
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
        生成画像一覧（確認用）
      </Typography>

      <FlowConnector />

      {/* メインコンテンツ: 画像リスト */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: "16px",
          border: "3px solid #FFCC80",
          backgroundColor: "#fff",
          minHeight: "60vh",
        }}
      >
        <ImageResultList
          images={images}
          isLoading={isLoading}
          onImageClick={handleImageClick}
        />
      </Paper>

      {/* 画像詳細モーダル */}
      <Dialog
        open={!!selectedImage}
        onClose={closeModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            overflow: "hidden",
          },
        }}
      >
        {selectedImage && (
          <Box sx={{ position: "relative", bgcolor: "#fff" }}>
            {/* モーダルヘッダー */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 2,
                borderBottom: "1px solid #eee",
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: "#333" }}
              >
                {selectedImage.title}
              </Typography>
              <IconButton onClick={closeModal}>
                <CloseIcon />
              </IconButton>
            </Box>

            {/* モーダル画像 */}
            <Box
              sx={{
                p: 2,
                bgcolor: "#f5f5f5",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <img
                src={selectedImage.url}
                alt={selectedImage.title}
                style={{
                  maxWidth: "100%",
                  maxHeight: "70vh",
                  objectFit: "contain",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                }}
              />
            </Box>

            {/* モーダル詳細情報 */}
            <Box sx={{ p: 3 }}>
              <Typography variant="body1" sx={{ color: "#555", mb: 2 }}>
                {selectedImage.description}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  color: "#888",
                  fontSize: "0.875rem",
                }}
              >
                <Typography variant="caption">
                  ID: {selectedImage.id}
                </Typography>
                {selectedImage.width && selectedImage.height && (
                  <Typography variant="caption">
                    サイズ: {selectedImage.width} x {selectedImage.height}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        )}
      </Dialog>
    </Box>
  );
};

export default ImageResultListPage;
