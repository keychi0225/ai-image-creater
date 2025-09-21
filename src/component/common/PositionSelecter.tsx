// PositionSelecter.tsx
import React from 'react';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

interface PositionSelecterProps {
    value: string;
    onChange: (event: SelectChangeEvent<string>) => void;
    disabled?: boolean;
}

const PositionSelecter: React.FC<PositionSelecterProps> = ({value, onChange, disabled,}) => {
  return (
    <FormControl sx={{width: 300}}>
      <InputLabel id="position-select-label">位置</InputLabel>
      <Select
        sx={{ textAlign: 'start' }}
        labelId="position-select-label"
        id="position-select"
        value={value}
        label="位置"
        onChange={onChange}
        disabled={disabled}
      >
        <MenuItem value="最上段の右側">最上段の右側</MenuItem>
        <MenuItem value="最上段の真ん中">最上段の真ん中</MenuItem>
        <MenuItem value="最上段の左側">最上段の左側</MenuItem>
        <MenuItem value="中段の右側">中段の右側</MenuItem>
        <MenuItem value="中段の真ん中">中段の真ん中</MenuItem>
        <MenuItem value="中段の左側">中段の左側</MenuItem>
        <MenuItem value="最下段の右側">最下段の右側</MenuItem>
        <MenuItem value="最下段の真ん中">最下段の真ん中</MenuItem>
        <MenuItem value="最下段の左側">最下段の左側</MenuItem>
        <MenuItem value="指定なし">指定なし</MenuItem>
      </Select>
    </FormControl>
  );
};

export default PositionSelecter;