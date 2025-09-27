// ResetVotesMUI.tsx
import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Typography,
  Box,
} from '@mui/material';

const ClearVoteModal: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const API_URL = 'https://clear-votes-64fgxin3kq-uc.a.run.app';

  const handleClickOpen = () => {
    setOpen(true);
    // モーダルを再度開く際に状態をリセット
    setMessage(null);
    setIsSuccess(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleReset = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error('サーバーエラーが発生しました。');
      }

      await response.json();
      setMessage('投票情報が正常に初期化されました。');
      setIsSuccess(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'リクエスト中に不明なエラーが発生しました。';
      setMessage(`初期化に失敗しました: ${errorMessage}`);
      setIsSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="contained" color="error" onClick={handleClickOpen}>
        投票を初期化する
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="reset-dialog-title"
        aria-describedby="reset-dialog-description"
      >
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 4,
              minWidth: 300,
            }}
          >
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>投票を初期化中です...</Typography>
          </Box>
        ) : message ? (
          <>
            <DialogContent>
              <DialogContentText
                sx={{
                  color: isSuccess ? 'success.main' : 'error.main',
                }}
              >
                {message}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} autoFocus>
                閉じる
              </Button>
            </DialogActions>
          </>
        ) : (
          <>
            <DialogTitle id="reset-dialog-title">
              {'投票情報の初期化'}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="reset-dialog-description">
                この操作はすべての投票データを削除し、元に戻すことはできません。本当に実行しますか？
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>キャンセル</Button>
              <Button onClick={handleReset} color="error" variant="contained">
                初期化を実行
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
};

export default ClearVoteModal;