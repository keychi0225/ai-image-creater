import Ranking from "../component/Ranking";
import { useState } from "react";
import { Box, Button, Modal } from "@mui/material";
import ClearVoteModal from "../component/ClearVoteModal";
import VoteSystemButton from "../component/VoteSystemButton";
import HomeStepper from "../layout/HomeStepper";

function HomePage() {
  const [open, setOpen] = useState(false); // ★モーダルの開閉を管理するstate

  const handleRankingOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 800,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
  };

  return (
    <>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          p: 2,
          top: 0,
          right: 0,
          gap: 2,
          zIndex: 1000,
        }}
      >
        <Button onClick={handleRankingOpen} variant="contained" color="primary">
          ランキングを表示
        </Button>
        <VoteSystemButton />
        <ClearVoteModal />
      </Box>
      <HomeStepper />
      {/* ★ランキングを表示するモーダル */}
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
    </>
  );
}

export default HomePage;
