import Ranking from "../component/Ranking";
import { useState } from "react";
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

// ダークテーマを定義
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#0a0e17", // 深い紺色/黒
      paper: "#111625", // 少し明るい紺色
    },
    primary: {
      main: "#00f2ff", // サイバーパンクなシアン
    },
    secondary: {
      main: "#ff0055", // ネオンピンク
    },
    text: {
      primary: "#e0f7fa",
      secondary: "#b2ebf2",
    },
  },
  typography: {
    fontFamily: '"Roboto Mono", "Consolas", "Monaco", monospace', // プログラムっぽい等幅フォント
    h6: {
      fontWeight: 700,
      letterSpacing: ".15rem",
      textTransform: "uppercase",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 2, // 少し角ばらせる
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
    border: "1px solid #00f2ff", // テーマカラーに合わせる
    boxShadow: 24,
    p: 4,
    maxHeight: "90vh",
    overflowY: "auto",
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          background:
            "radial-gradient(circle at 50% -20%, #1a2c4e 0%, #0a0e17 100%)", // 近未来的な背景グラデーション
        }}
      >
        <AppBar
          position="sticky"
          color="transparent"
          elevation={0}
          sx={{
            backdropFilter: "blur(10px)",
            borderBottom: "1px solid rgba(0, 242, 255, 0.1)",
          }}
        >
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Typography
              variant="h6"
              component="div"
              sx={{
                color: "primary.main",
                textShadow: "0 0 10px rgba(0, 242, 255, 0.5)",
              }}
            >
              PopCreate
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                onClick={handleRankingOpen}
                variant="outlined"
                color="inherit"
                sx={{ borderColor: "rgba(255,255,255,0.3)" }}
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
