import React from 'react';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

interface SizeSelecterProps {
  value: string;
  onChange: (event: SelectChangeEvent<string>) => void;
  disabled?: boolean;
}

const SizeSelecter: React.FC<SizeSelecterProps> = ({value, onChange, disabled,}) => {
  return (
    <FormControl sx={{width: 300}}>
      <InputLabel id="size-select-label">文字サイズ</InputLabel>
      <Select
        sx={{ textAlign: 'start' }}
        labelId="size-select-label"
        id="size-select"
        value={value}
        label="サイズ"
        onChange={onChange}
        disabled={disabled}
      >
        <MenuItem value="小さい">小さい</MenuItem>
        <MenuItem value="普通">普通</MenuItem>
        <MenuItem value="やや大きい">やや大きい</MenuItem>
        <MenuItem value="強調して大きい">強調して大きい</MenuItem>
        <MenuItem value="指定なし">指定なし</MenuItem>
      </Select>
    </FormControl>
  );
};

export default SizeSelecter;