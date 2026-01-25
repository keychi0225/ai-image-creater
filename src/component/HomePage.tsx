import Ranking from "../component/Ranking";
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Button,
  Modal,
  AppBar,
  Toolbar,
  Typography,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
} from "@mui/material";
import ClearVoteModal from "../component/ClearVoteModal";
import VoteSystemButton from "../component/VoteSystemButton";
import HomeStepper from "../layout/HomeStepper";

// 子供向けテーマ（淡い黄色ベース）を定義
const kidsTheme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#FFF8E1", // 淡い黄色
      paper: "#FFFFFF",
    },
    primary: {
      main: "#FF4081", // ピンク
    },
    secondary: {
      main: "#FF9800", // オレンジ
    },
    text: {
      primary: "#5D4037", // 濃い茶色
      secondary: "#8D6E63", // 薄い茶色
    },
  },
  typography: {
    fontFamily:
      '"M PLUS Rounded 1c", "Hiragino Maru Gothic ProN", "Quicksand", sans-serif',
    h6: {
      fontWeight: 700,
      color: "#E65100",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "50px", // 丸みを持たせる
          textTransform: "none",
          fontWeight: "bold",
        },
      },
    },
  },
});

function HomePage() {
  const [open, setOpen] = useState(false);

  const handleRankingOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "80%",
    maxWidth: 800,
    bgcolor: "background.paper",
    border: "4px solid #FFCC80", // テーマカラーに合わせる
    borderRadius: "24px",
    boxShadow: 24,
    p: 4,
    maxHeight: "90vh",
    overflowY: "auto",
  };

  return (
    <ThemeProvider theme={kidsTheme}>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          backgroundColor: "background.default",
        }}
      >
        <AppBar
          position="sticky"
          color="transparent"
          elevation={0}
          sx={{
            backdropFilter: "blur(10px)",
            borderBottom: "2px solid #FFECB3",
            backgroundColor: "rgba(255, 248, 225, 0.8)",
          }}
        >
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Typography
              variant="h6"
              component="div"
              sx={{
                color: "#E65100",
                fontWeight: "bold",
              }}
            >
              PopCreate
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                component={Link}
                to="/result"
                variant="outlined"
                color="primary"
                sx={{
                  borderColor: "#FF4081",
                  color: "#FF4081",
                  backgroundColor: "#fff",
                }}
              >
                生成画像確認
              </Button>
              <Button
                onClick={handleRankingOpen}
                variant="outlined"
                color="primary"
                sx={{
                  borderColor: "#FF4081",
                  color: "#FF4081",
                  backgroundColor: "#fff",
                }}
              >
                ランキングを表示
              </Button>
              <VoteSystemButton />
              <ClearVoteModal />
            </Box>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 4, mb: 8, flexGrow: 1 }}>
          <HomeStepper />
        </Container>
      </Box>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="ranking-modal-title"
        aria-describedby="ranking-modal-description"
      >
        <Box sx={modalStyle}>
          <Ranking />
        </Box>
      </Modal>
    </ThemeProvider>
  );
}

export default HomePage;
