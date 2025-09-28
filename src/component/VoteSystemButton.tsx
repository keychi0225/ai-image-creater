import React from 'react';
import Button from '@mui/material/Button';

const VoteSystemButton: React.FC = () => {
  return (
    // ルーティングを設定している場合
    <Button
      variant="contained"
      component="a"
      href="/VoteSystem.html"
      target="_blank" // ここで新しいタブで開くように指定
      rel="noopener noreferrer" // セキュリティのための属性
    >
      投票ページを別タブで開く
    </Button>
  );
};

export default VoteSystemButton;