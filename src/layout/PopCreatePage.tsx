import { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  Paper,
  LinearProgress,
} from "@mui/material";
import SizeSelecter from "../component/common/SizeSelecter";
import PositionSelecter from "../component/common/PositionSelecter";

const API_ENDPOINT = "https://generate-and-save-image-64fgxin3kq-uc.a.run.app"; // ⚠️ Your API endpoint URL

interface PopCreatePageProps {
  thoughts: string;
  catchCopy: string;
  onSyncImage: (imageName: string) => void;
  onLoad: (isLoading: boolean) => void;
}

// 近未来的な接続ラインコンポーネント
const FlowConnector = () => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      my: 1,
    }}
  >
    <Box
      sx={{
        width: "2px",
        height: "40px",
        background:
          "linear-gradient(180deg, rgba(0,242,255,0) 0%, rgba(0,242,255,1) 50%, rgba(0,242,255,0) 100%)",
        boxShadow: "0 0 8px rgba(0, 242, 255, 0.6)",
      }}
    />
  </Box>
);

const PopCreatePage = (props: PopCreatePageProps) => {
  const catchCopyOption = props.catchCopy.split("・") as Array<string>;
  const popSize = { width: "1536", height: "1024" };
  const [premise, setPremise] =
    useState(`①文字要素は最優先で必ず出力してください。
②手描き風の日本の児童書POPを作成してください。
③クレヨンと色鉛筆で描いたように、ざらざらした生成り色の紙（12cm×8cm） に表現してください。
④文字は小学4年生が書いたような、不揃いで遊び心のある筆跡。
⑤見出しは赤と青を交互に配置し、大きく黒縁取りで描いてください。
⑥全体は子どもらしく温かみがあり、少しミステリアスでインパクトがある雰囲気。`);
  const [catchCopy, setCatchCopy] = useState("");
  const [emotionalPhrases, setEmotionalPhrases] = useState("");
  const [synopsis, setSynopsis] = useState(``);
  const [synopsis2, setSynopsis2] = useState(``);
  const [synopsis3, setSynopsis3] = useState(``);
  const [signature, setSignature] = useState("―― K.T.（小学4年生・男子）");
  const [publisher, setPublisher] = useState("○○○○社");
  const [illustrationElements, setIllustrationElements] = useState(
    `左下にテーマに関連するキャラクターや動物（吹き出しつき）`
  );
  const [style, setStyle] =
    useState(`①【最重要】余白があれば、背景にテーマに関連する小物をシンプルに描く
②隣に説明している少年
③子どもが描いたようなラフで温かみのあるタッチ。
④見る人が「思わず立ち止まる」インパクトと、ほんの少しのミステリアスさをもたせる。`);
  const outputConditions = `必ず PNG形式 で生成してください。`;

  //ドロップダウン
  const [catchCopyPostition, setCatchCopyPostition] =
    useState("最上段の真ん中");
  const [catchCopySize, setCatchCopySize] = useState("強調して大きい");
  const [emotionalPhrasesPostition, setEmotionalPhrasesPostition] =
    useState("中段の真ん中");
  const [emotionalPhrasesSize, setEmotionalPhrasesSize] =
    useState("やや大きい");
  const [synopsisPostition, setSynopsisPostition] = useState("中段の左側");
  const [synopsisSize, setSynopsisSize] = useState("小さい");
  const [signaturePostition, setSignaturePostition] = useState("最下段の左側");
  const [signatureSize, setSignatureSize] = useState("小さい");
  const [publisherPostition, setPublisherPostition] = useState("最下段の右側");
  const [publisherSize, setPublisherSize] = useState("小さい");

  //チェックボックス
  const [isEmotionalPhrases, setIsEmotionalPhrases] = useState(false);
  const [isSignature, setIsSignature] = useState(false);
  const [isPublisher, setIsPublisher] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  // タイマー用のstate
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setElapsedTime(0);
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleCreatePop = async () => {
    setIsLoading(true);
    props.onLoad(true);
    setResponseMessage(null);
    setIsError(false);

    try {
      const prompt = `以下の条件で画像を生成してください。
      
最優先の条件：${premise}

【文字要素】
キャッチコピー（位置は${catchCopyPostition}/文字サイズは${catchCopySize}）：${catchCopy}
あらすじ（位置は${synopsisPostition}/文字サイズは${synopsisSize}）： 
 ${synopsis && `・${synopsis}`}
 ${synopsis2 && `・${synopsis2}`}
 ${synopsis3 && `・${synopsis3}`}

【オプション要素】
${
  isEmotionalPhrases
    ? `感情フレーズ（位置は${emotionalPhrasesPostition}/文字サイズは${emotionalPhrasesSize}）：${emotionalPhrases}`
    : ""
}
${
  isSignature
    ? `署名（位置は${signaturePostition}/文字サイズは${signatureSize}）：${signature}`
    : ""
}
${
  isPublisher
    ? `出版社（位置は${publisherPostition}/文字サイズは${publisherSize}）：${publisher}`
    : ""
}

【イラスト要素】
イラスト：${illustrationElements}
スタイル：${style}
出力条件：${outputConditions}`;

      const response = await fetch(
        `${API_ENDPOINT}?prompt=${prompt}&size=${popSize.width}x${popSize.height}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // If your API requires an Authorization header, add it here.
            // 'Authorization': `Bearer ${apiKey}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setResponseMessage(data.message || "POP creation successful!");
        props.onSyncImage(data.image_path);
        setIsLoading(false);
      } else {
        throw new Error(data.error || "Something went wrong on the server.");
      }
    } catch (error) {
      console.error("API call failed:", error);
      // ① まず、errorがErrorオブジェクトのインスタンスであるかを確認
      if (error instanceof Error) {
        // ② Error型として扱えるため、.messageに安全にアクセスできる
        setResponseMessage(error.message);
      } else {
        // ③ Errorオブジェクトではない場合
        setResponseMessage("予期せぬエラーが発生しました。");
      }
      setIsError(true);
    } finally {
      setIsLoading(false);
      props.onLoad(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        p: 1,
        width: "100%",
      }}
    >
      <Typography variant="h5" component="h1" gutterBottom align="center">
        POP 作成ページ
      </Typography>

      {/* 最優先の条件 */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Typography
          variant="h6"
          component="h2"
          sx={{ textAlign: "start", mb: 2, color: "primary.main" }}
        >
          【最優先の条件】
        </Typography>
        <TextField
          fullWidth
          multiline
          minRows={6}
          label="最優先の条件"
          value={premise}
          onChange={(e) => setPremise(e.target.value)}
        />
      </Paper>

      <FlowConnector />

      {/* キャッチコピー */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Typography
          variant="h6"
          component="h2"
          sx={{ textAlign: "start", mb: 2, color: "primary.main" }}
        >
          【キャッチコピー】
        </Typography>
        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          <PositionSelecter
            value={catchCopyPostition}
            onChange={(event) => setCatchCopyPostition(event.target.value)}
          />
          <SizeSelecter
            value={catchCopySize}
            onChange={(event) => setCatchCopySize(event.target.value)}
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 1,
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">
              キャッチコピー
            </InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={catchCopy}
              label="キャッチコピー"
              onChange={(e) => setCatchCopy(e.target.value)}
              sx={{ textAlign: "left" }}
            >
              {catchCopyOption.map((value) => {
                return (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="自由入力したい場合のみ利用"
            value={catchCopy}
            onChange={(e) => setCatchCopy(e.target.value)}
          />
        </Box>
      </Paper>

      <FlowConnector />

      {/* 本の内容 */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Typography
          variant="h6"
          component="h2"
          sx={{ textAlign: "start", mb: 2, color: "primary.main" }}
        >
          【本の内容】
        </Typography>
        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          <PositionSelecter
            value={synopsisPostition}
            onChange={(event) => setSynopsisPostition(event.target.value)}
          />
          <SizeSelecter
            value={synopsisSize}
            onChange={(event) => setSynopsisSize(event.target.value)}
          />
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="①あらすじ要素(15文字以内)"
              inputProps={{
                maxLength: 15,
              }}
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              variant="outlined"
            />
          </Box>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="②あらすじ要素(15文字以内)"
              inputProps={{
                maxLength: 15,
              }}
              value={synopsis2}
              onChange={(e) => setSynopsis2(e.target.value)}
              variant="outlined"
            />
          </Box>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="③あらすじ要素(15文字以内)"
              inputProps={{
                maxLength: 15,
              }}
              value={synopsis3}
              onChange={(e) => setSynopsis3(e.target.value)}
              variant="outlined"
            />
          </Box>
        </Box>
      </Paper>

      <FlowConnector />

      {/* イラスト要素 */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Typography
          variant="h6"
          component="h2"
          sx={{ textAlign: "start", mb: 2, color: "primary.main" }}
        >
          【イラスト要素】
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <TextField
            fullWidth
            multiline
            label="イラスト"
            value={illustrationElements}
            onChange={(e) => setIllustrationElements(e.target.value)}
          />
          <TextField
            fullWidth
            multiline
            minRows={4}
            label="スタイル"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
          />
        </Box>
      </Paper>

      <FlowConnector />

      {/* オプション機能 */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Typography
          variant="h6"
          component="h2"
          sx={{ textAlign: "start", mb: 1, color: "primary.main" }}
        >
          【オプション機能】
        </Typography>
        <Typography
          sx={{
            textAlign: "start",
            mb: 2,
            color: "text.secondary",
            fontSize: "0.9rem",
          }}
        >
          <span>※使いたいときだけ有効化</span>
        </Typography>

        {/* 感情フレーズ */}
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  onChange={(_, checked) => {
                    setIsEmotionalPhrases(checked);
                  }}
                />
              }
              label="【感情フレーズ】"
            />
          </Box>
          {isEmotionalPhrases && (
            <Box sx={{ pl: 2, borderLeft: "2px solid #333", mb: 3 }}>
              <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
                <PositionSelecter
                  value={emotionalPhrasesPostition}
                  onChange={(event) =>
                    setEmotionalPhrasesPostition(event.target.value)
                  }
                  disabled={!isEmotionalPhrases}
                />
                <SizeSelecter
                  value={emotionalPhrasesSize}
                  onChange={(event) =>
                    setEmotionalPhrasesSize(event.target.value)
                  }
                  disabled={!isEmotionalPhrases}
                />
              </Box>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  fullWidth
                  label="感情フレーズ"
                  value={emotionalPhrases}
                  onChange={(e) => setEmotionalPhrases(e.target.value)}
                  disabled={!isEmotionalPhrases}
                />
              </Box>
            </Box>
          )}
        </Box>

        {/* 署名 */}
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  onChange={(_, checked) => {
                    setIsSignature(checked);
                  }}
                />
              }
              label="【署名】"
            />
          </Box>
          {isSignature && (
            <Box sx={{ pl: 2, borderLeft: "2px solid #333", mb: 3 }}>
              <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
                <PositionSelecter
                  value={signaturePostition}
                  onChange={(event) =>
                    setSignaturePostition(event.target.value)
                  }
                  disabled={!isSignature}
                />
                <SizeSelecter
                  value={signatureSize}
                  onChange={(event) => setSignatureSize(event.target.value)}
                  disabled={!isSignature}
                />
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <TextField
                  fullWidth
                  label="署名"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  disabled={!isSignature}
                />
              </Box>
            </Box>
          )}
        </Box>

        {/* 出版社 */}
        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  onChange={(_, checked) => {
                    setIsPublisher(checked);
                  }}
                />
              }
              label="【出版社】"
            />
          </Box>
          {isPublisher && (
            <Box sx={{ pl: 2, borderLeft: "2px solid #333" }}>
              <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
                <PositionSelecter
                  value={publisherPostition}
                  onChange={(event) =>
                    setPublisherPostition(event.target.value)
                  }
                  disabled={!isPublisher}
                />
                <SizeSelecter
                  value={publisherSize}
                  onChange={(event) => setPublisherSize(event.target.value)}
                  disabled={!isPublisher}
                />
              </Box>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  fullWidth
                  label="出版社"
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                  disabled={!isPublisher}
                />
              </Box>
            </Box>
          )}
        </Box>
      </Paper>

      <FlowConnector />

      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, textAlign: "center" }}>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreatePop}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : "POP を作成"}
          </Button>
        </Box>

        {isLoading && (
          <Box sx={{ width: "100%", mt: 3, maxWidth: 600, mx: "auto" }}>
            <LinearProgress
              variant="determinate"
              value={Math.min((elapsedTime / 60) * 100, 100)}
              sx={{ height: 10, borderRadius: 5 }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {elapsedTime <= 60
                ? `生成中... 平均作成時間は約1分です (${elapsedTime}秒経過)`
                : `生成に時間がかかっています。もうしばらくお待ちください... (${elapsedTime}秒経過)`}
            </Typography>
          </Box>
        )}

        {responseMessage && (
          <Box sx={{ mt: 3 }}>
            <Alert severity={isError ? "error" : "success"}>
              {responseMessage}
            </Alert>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default PopCreatePage;
