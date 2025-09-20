import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Stack,
  TextField,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';

const API_ENDPOINT = 'https://generate-and-save-image-64fgxin3kq-uc.a.run.app'; // ⚠️ Your API endpoint URL

interface PopCreatePageProps {
  thoughts: string;
}
const PopCreatePage: React.FC<PopCreatePageProps> = () => {
  const [popSize, setPopSize] = useState({ width: '1536', height: '1024' });
  const [premise, setPremise] = useState(`手描き風の日本の児童書POPを作成してください。
  クレヨンと色鉛筆で描いたように、ざらざらした生成り色の紙（12cm×8cm） に表現してください。
  文字は小学4年生が書いたような、不揃いで遊び心のある筆跡。
  見出しは赤と青を交互に配置し、大きく黒縁取りで描いてください。
  全体は子どもらしく温かみがあり、少しミステリアスでインパクトがある雰囲気。`);
  const [catchCopy, setCatchCopy] = useState('「✨ ［ここにキャッチコピー］ ✨」');
  const [emotionalPhrases, setEmotionalPhrases] = useState('「［ここに感情フレーズ］」');
  const [synopsis, setSynopsis] = useState(`［ここに短めのあらすじを3行程度で入れる］
（※文字切れを防ぐため短文・改行ありで指定）`);
  const [signature, setSignature] = useState('―― K.T.（小学4年生・男子）');
  const [publisher, setPublisher] = useState('［出版社名］');
  const [illustrationElements, setIllustrationElements] = useState(`
  左下にテーマに関連するキャラクターや動物（吹き出しつき）
  隣に説明している少年
  背景にテーマに関連する小物をシンプルに描く
  『犬の謎』 → 犬小屋、足あと、消火栓
  『ふつうが一番ふしぎだった！』／『みのまわりの謎大全』 → 標識、電線、駅などの町風景
  『ドックタウン』 → 街並みや建物、犬たち`);
  const [style, setStyle] = useState(`子どもが描いたようなラフで温かみのあるタッチ。
  見る人が「思わず立ち止まる」インパクトと、ほんの少しのミステリアスさをもたせる。`);
  const [outputConditions, setOutputConditions] = useState(`
  必ず PNG形式 で生成してください。
  文字をすべて表示することを優先してください。`);
  
  const [isLoading, setIsLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const handleCreatePop = async () => {
    setIsLoading(true);
    setResponseMessage(null);
    setIsError(false);

    try {
      const prompt = `前提：${premise}

【文字要素】
キャッチコピー（最上部・大きく）：${catchCopy}
感情フレーズ（中段・強調）：${emotionalPhrases}
あらすじ要素（下段・小さめ）：${synopsis}
署名（右下）：${signature}
出版社（下部・小さく）：${publisher}

【イラスト要素】
イラスト：${illustrationElements}
スタイル：${style}
出力条件：${outputConditions}`;

      const response = await fetch(`${API_ENDPOINT}?prompt=${prompt}&size=${popSize.width}x${popSize.height}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // If your API requires an Authorization header, add it here.
          // 'Authorization': `Bearer ${apiKey}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setResponseMessage(data.message || 'POP creation successful!');
      } else {
        throw new Error(data.error || 'Something went wrong on the server.');
      }

    } catch (error) {
      console.error('API call failed:', error);
        // ① まず、errorがErrorオブジェクトのインスタンスであるかを確認
        if (error instanceof Error) {
            // ② Error型として扱えるため、.messageに安全にアクセスできる
            setResponseMessage(error.message);
        } else {
            // ③ Errorオブジェクトではない場合
            setResponseMessage('予期せぬエラーが発生しました。');
        }
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4, p: 3, maxWidth: 600, boxShadow: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          POP 作成ページ
        </Typography>
        <Typography variant="h5" component="h2" sx={{textAlign: 'start', mt: 3, mb: 2 }}>
          【前提】
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          label="前提"
          value={premise}
          onChange={(e) => setPremise(e.target.value)}
        />

        <Typography variant="h5" component="h2" sx={{textAlign: 'start', mt: 3, mb: 2 }}>
          【サイズ】
        </Typography>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label="幅 (px)"
              type="number"
              value={popSize.width}
              onChange={(e) => setPopSize({ ...popSize, width: e.target.value })}
            />
            <TextField
              fullWidth
              label="高さ (px)"
              type="number"
              value={popSize.height}
              onChange={(e) => setPopSize({ ...popSize, height: e.target.value })}
            />
          </Box>
        </Stack>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h5" component="h2" sx={{textAlign: 'start', mt: 4, mb: 2 }}>
            【文字要素】
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={2}
            label="上部で選定したキャッチコピー候補"
            value={catchCopy}
            onChange={(e) => setCatchCopy(e.target.value)}
          />
          <br/>
          <TextField
            fullWidth
            multiline
            rows={2}
            label="感情フレーズ"
            value={emotionalPhrases}
            onChange={(e) => setEmotionalPhrases(e.target.value)}
          />
          <br/>
          <TextField
            fullWidth
            multiline
            rows={2}
            label="あらすじ要素"
            value={synopsis}
            onChange={(e) => setSynopsis(e.target.value)}
          />
          <br/>
          <TextField
            fullWidth
            multiline
            rows={2}
            label="署名"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
          />
          <br/>
          <TextField
            fullWidth
            multiline
            rows={2}
            label="出版社"
            value={publisher}
            onChange={(e) => setPublisher(e.target.value)}
          />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h5" component="h2" sx={{ textAlign: 'start', mt: 4, mb: 2 }}>
            【イラスト要素】
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="イラスト"
            value={illustrationElements}
            onChange={(e) => setIllustrationElements(e.target.value)}
          />
          <br/>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="スタイル"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
          />
          <br/>
          <TextField
            fullWidth
            multiline
            rows={2}
            label="出力条件"
            value={outputConditions}
            onChange={(e) => setOutputConditions(e.target.value)}
          />
        </Box>


        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreatePop}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'POP を作成'}
          </Button>
        </Box>
        
        {responseMessage && (
          <Box sx={{ mt: 3 }}>
            <Alert severity={isError ? "error" : "success"}>
              {responseMessage}
            </Alert>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default PopCreatePage;