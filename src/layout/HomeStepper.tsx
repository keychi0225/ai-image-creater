import * as React from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Button from "@mui/material/Button";
import TextChat from "./TextChat";
import PopCreatePage from "./PopCreatePage";
import ImageResultPage from "./ImageResultPage";
import { Paper } from "@mui/material";

const steps = ["キャッチコピー作成", "POP作成", "生成結果"];

export default function HomeStepper() {
  const [thoughts, setThoughts] = React.useState<string>("");
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set<number>());
  const [catchCopy, setCatchCopy] = React.useState<string>("");
  const [imageName, setImageName] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const isStepSkipped = (step: number) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Stepper activeStep={activeStep}>
        {steps.map((label) => {
          const stepProps: { completed?: boolean } = {};
          const labelProps: {
            optional?: React.ReactNode;
          } = {};
          return (
            <Step key={label} {...stepProps}>
              <StepLabel {...labelProps}>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
      <div>
        <Paper
          sx={{
            m: 4,
            p: { xs: 2, md: 4 },
            background: "rgba(17, 22, 37, 0.6)", // 半透明のダークな背景
            backdropFilter: "blur(12px)", // すりガラス効果
            border: "1px solid rgba(0, 242, 255, 0.15)", // 薄いネオンシアンのボーダー
            boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)", // 深い影
            borderRadius: "16px",
          }}
          elevation={0}
        >
          {activeStep == 0 && (
            <TextChat onChange={setThoughts} onSyncCatchCopy={setCatchCopy} />
          )}
          {activeStep == 1 && (
            <PopCreatePage
              thoughts={thoughts}
              catchCopy={catchCopy}
              onSyncImage={setImageName}
              onLoad={setIsLoading}
            />
          )}
          {activeStep == 2 && <ImageResultPage imageName={imageName} />}
          <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
            {!isLoading && (
              <Button
                variant="contained"
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ m: 4 }}
              >
                Back
              </Button>
            )}
            <Box sx={{ flex: "1 1 auto" }} />
            {!isLoading && activeStep !== 2 && (
              <Button sx={{ m: 4 }} variant="contained" onClick={handleNext}>
                {activeStep === steps.length - 1 ? "Finish" : "Next"}
              </Button>
            )}
          </Box>
        </Paper>
      </div>
    </Box>
  );
}
