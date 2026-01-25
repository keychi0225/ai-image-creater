import React from "react";
import {
  Box,
  Grid,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
  CircularProgress,
} from "@mui/material";

// 画像データの型定義
export interface ImageResult {
  id: string;
  url: string;
  thumbnailUrl?: string;
  title: string;
  description?: string;
  width?: number;
  height?: number;
}

// コンポーネントのProps定義
interface ImageResultListProps {
  images: ImageResult[];
  isLoading?: boolean;
  onImageClick?: (image: ImageResult) => void;
}

const ImageResultList: React.FC<ImageResultListProps> = ({
  images,
  isLoading = false,
  onImageClick,
}) => {
  // ローディング中の表示
  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          py: 10,
        }}
      >
        <CircularProgress size={40} sx={{ color: "#FF4081" }} />
        <Typography sx={{ ml: 2, color: "text.secondary", fontWeight: "bold" }}>
          読み込み中...
        </Typography>
      </Box>
    );
  }

  // 画像がない場合の表示
  if (images.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 10, color: "text.secondary" }}>
        <Typography>画像が見つかりませんでした。</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", py: 2 }}>
      <Typography
        variant="h5"
        component="h2"
        sx={{ fontWeight: "bold", mb: 3, color: "#5D4037" }}
      >
        画像検索結果
      </Typography>

      {/* グリッドレイアウト: モバイルで1列、タブレットで2列、PCで3列、大型画面で4列 */}
      <Grid container spacing={3} sx={{ justifyContent: "center" }}>
        {images.map((image) => (
          <Grid key={image.id}>
            <Card
              sx={{
                width: "350px",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                borderRadius: "16px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                transition: "transform 0.3s, box-shadow 0.3s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
                },
              }}
            >
              <CardActionArea
                onClick={() => onImageClick && onImageClick(image)}
                sx={{
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "stretch",
                  justifyContent: "flex-start",
                }}
              >
                <CardMedia
                  component="img"
                  image={image.thumbnailUrl || image.url}
                  alt={image.title}
                  sx={{
                    aspectRatio: "16/9",
                    objectFit: "cover",
                    backgroundColor: "#f5f5f5",
                  }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography
                    gutterBottom
                    variant="h6"
                    component="div"
                    noWrap
                    sx={{ fontSize: "1rem", fontWeight: "bold", color: "#333" }}
                  >
                    {image.title}
                  </Typography>
                  {image.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: "-webkit-box",
                        overflow: "hidden",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 2,
                      }}
                    >
                      {image.description}
                    </Typography>
                  )}
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ImageResultList;
