import styled from "@emotion/styled";

// Styled componentsの作成
export const StyledFieldset = styled('fieldset')({
  border: '1px solid',
  borderColor: '#e0e0e0',
  borderRadius: '8px',
  padding: '16px',
  margin: '16px 0',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
});

export const StyledLegend = styled('legend')({
  fontSize: 24,
  fontWeight: 'bold',
  color: '#424242',
  backgroundColor: 'white', // 背景を白にして枠線と重なる部分を隠す
  position: 'absolute',
  marginTop: -40,
});