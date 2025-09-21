import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Stack,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import SizeSelecter from './common/SizeSelecter';
import PositionSelecter from './common/PositionSelecter';

const API_ENDPOINT = 'https://generate-and-save-image-64fgxin3kq-uc.a.run.app'; // ⚠️ Your API endpoint URL

interface PopCreatePageProps {
  thoughts: string;
}
const PopCreatePage: React.FC<PopCreatePageProps> = () => {
  const [popSize, setPopSize] = useState({ width: '1536', height: '1024' });
  const [premise, setPremise] = useState(`①文字要素は最優先で必ず出力してください。
②手描き風の日本の児童書POPを作成してください。
③クレヨンと色鉛筆で描いたように、ざらざらした生成り色の紙（12cm×8cm） に表現してください。
④文字は小学4年生が書いたような、不揃いで遊び心のある筆跡。
⑤見出しは赤と青を交互に配置し、大きく黒縁取りで描いてください。
⑥全体は子どもらしく温かみがあり、少しミステリアスでインパクトがある雰囲気。`);
  const [catchCopy, setCatchCopy] = useState('');
  const [emotionalPhrases, setEmotionalPhrases] = useState('');
  const [synopsis, setSynopsis] = useState(``);
  const [signature, setSignature] = useState('―― K.T.（小学4年生・男子）');
  const [publisher, setPublisher] = useState('○○○○社');
  const [illustrationElements, setIllustrationElements] = useState(`左下にテーマに関連するキャラクターや動物（吹き出しつき）
隣に説明している少年
背景にテーマに関連する小物をシンプルに描く
  『犬の謎』 → 犬小屋、足あと、消火栓
  『ふつうが一番ふしぎだった！』／『みのまわりの謎大全』 → 標識、電線、駅などの町風景
  『ドックタウン』 → 街並みや建物、犬たち`);
  const [style, setStyle] = useState(`子どもが描いたようなラフで温かみのあるタッチ。
見る人が「思わず立ち止まる」インパクトと、ほんの少しのミステリアスさをもたせる。`);
  const [outputConditions, setOutputConditions] = useState(`必ず PNG形式 で生成してください。`);

  //ドロップダウン
  const [catchCopyPostition, setCatchCopyPostition] = useState('最上段の真ん中');
  const [catchCopySize, setCatchCopySize] = useState('強調して大きい');
  const [emotionalPhrasesPostition, setEmotionalPhrasesPostition] = useState('中段の真ん中');
  const [emotionalPhrasesSize, setEmotionalPhrasesSize] = useState('やや大きい');
  const [synopsisPostition, setSynopsisPostition] = useState('中段の左側');
  const [synopsisSize, setSynopsisSize] = useState('小さい');
  const [signaturePostition, setSignaturePostition] = useState('最下段の左側');
  const [signatureSize, setSignatureSize] = useState('小さい');
  const [publisherPostition, setPublisherPostition] = useState('最下段の右側');
  const [publisherSize, setPublisherSize] = useState('小さい');

  //チェックボックス
  const [isEmotionalPhrases, setIsEmotionalPhrases] = useState(true);
  const [isSynopsis, setIsSynopsis] = useState(true);
  const [isSignature, setIsSignature] = useState(true);
  const [isPublisher, setIsPublisher] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const handleCreatePop = async () => {
    setIsLoading(true);
    setResponseMessage(null);
    setIsError(false);

    try {
      const prompt = `以下の条件で画像を生成してください。
      
最優先の条件：${premise}

【文字要素】
キャッチコピー（位置は${catchCopyPostition}/文字サイズは${catchCopySize}）：${catchCopy}
${isEmotionalPhrases ? `感情フレーズ（位置は${emotionalPhrasesPostition}/文字サイズは${emotionalPhrasesSize}）：${emotionalPhrases}` : ""}
${isSynopsis ? `あらすじ要素（位置は${synopsisPostition}/文字サイズは${synopsisSize}）：${synopsis}` : ""}
${isSignature ? `署名（位置は${signaturePostition}/文字サイズは${signatureSize}）：${signature}` : ""}
${isPublisher ? `出版社（位置は${publisherPostition}/文字サイズは${publisherSize}）：${publisher}` : ""}

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
    <Container>
      <Box sx={{ my: 4, p: 3, minWidth: 1200, boxShadow: 3, borderRadius: 2, bgcolor: 'background.paper', position: 'relative', }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          POP 作成ページ
        </Typography>
        <Typography variant="h5" component="h2" sx={{textAlign: 'start', mt: 3, mb: 2 }}>
          【POPのサイズ】
        </Typography>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              sx={{width: 100}}
              label="幅 (px)"
              type="number"
              value={popSize.width}
              onChange={(e) => setPopSize({ ...popSize, width: e.target.value })}
            />
            <TextField
              sx={{width: 100}}
              label="高さ (px)"
              type="number"
              value={popSize.height}
              onChange={(e) => setPopSize({ ...popSize, height: e.target.value })}
            />
          </Box>
        </Stack>
        <Typography variant="h5" component="h2" sx={{textAlign: 'start', mt: 3, mb: 2 }}>
          【最優先の条件】
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          label="最優先の条件"
          value={premise}
          onChange={(e) => setPremise(e.target.value)}
        />
        <Typography variant="h5" component="h2" sx={{textAlign: 'start', mt: 3, mb: 2 }}>
          【キャッチコピー】
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 4}}>
          <PositionSelecter value={catchCopyPostition} onChange={(event) => setCatchCopyPostition(event.target.value)} />
          <SizeSelecter value={catchCopySize} onChange={(event) => setCatchCopySize(event.target.value)} />
          <TextField
            fullWidth
            label="キャッチコピー"
            value={catchCopy}
            onChange={(e) => setCatchCopy(e.target.value)}
          />
        </Box>

        <Box sx={{ display: 'flex', mt: 4, alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isEmotionalPhrases}
                onChange={(event) => setIsEmotionalPhrases(event.target.checked)}
              />
            }
            label=""
          />
          <Typography variant="h5" component="h2" sx={{textAlign: 'start', }}>
            【感情フレーズ】
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          <PositionSelecter value={emotionalPhrasesPostition}
            onChange={(event) => setEmotionalPhrasesPostition(event.target.value)}
            disabled={!isEmotionalPhrases} />
          <SizeSelecter value={emotionalPhrasesSize}
            onChange={(event) => setEmotionalPhrasesSize(event.target.value)}
            disabled={!isEmotionalPhrases} />
          <TextField
            fullWidth
            label="感情フレーズ"
            value={emotionalPhrases}
            onChange={(e) => setEmotionalPhrases(e.target.value)}
            disabled={!isEmotionalPhrases}
          />
        </Box>

        <Box sx={{ display: 'flex', mt: 4, alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isSynopsis}
                onChange={(event) => setIsSynopsis(event.target.checked)}
              />
            }
            label=""
          />
          <Typography variant="h5" component="h2" sx={{textAlign: 'start', }}>
            【あらすじ要素】
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          <PositionSelecter value={synopsisPostition}
            onChange={(event) => setSynopsisPostition(event.target.value)}
            disabled={!isSynopsis} />
          <SizeSelecter value={synopsisSize}
            onChange={(event) => setSynopsisSize(event.target.value)} 
            disabled={!isSynopsis}/>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="あらすじ要素"
            value={synopsis}
            onChange={(e) => setSynopsis(e.target.value)}
            disabled={!isSynopsis}
          />
        </Box>

        <Box sx={{ display: 'flex', mt: 4, alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isSignature}
                onChange={(event) => setIsSignature(event.target.checked)}
              />
            }
            label=""
          />
          <Typography variant="h5" component="h2" sx={{textAlign: 'start', mt: 3, mb: 2 }}>
            【署名】
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          <PositionSelecter value={signaturePostition}
            onChange={(event) => setSignaturePostition(event.target.value)}
            disabled={!isSignature} />
          <SizeSelecter value={signatureSize}
            onChange={(event) => setSignatureSize(event.target.value)}
            disabled={!isSignature} />
          <TextField
            fullWidth
            label="署名"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            disabled={!isSignature}
          />
        </Box>

        <Box sx={{ display: 'flex', mt: 4, alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isPublisher}
                onChange={(event) => setIsPublisher(event.target.checked)}
              />
            }
            label=""
          />
          <Typography variant="h5" component="h2" sx={{textAlign: 'start', mt: 3, mb: 2 }}>
            【出版社】
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          <PositionSelecter value={publisherPostition}
            onChange={(event) => setPublisherPostition(event.target.value)}
            disabled={!isPublisher} />
          <SizeSelecter value={publisherSize}
            onChange={(event) => setPublisherSize(event.target.value)}
            disabled={!isPublisher} />
          <TextField
            fullWidth
            label="出版社"
            value={publisher}
            onChange={(e) => setPublisher(e.target.value)}
            disabled={!isPublisher}
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