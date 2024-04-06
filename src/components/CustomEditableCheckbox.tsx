import { GridRenderEditCellParams, useGridApiContext } from '@mui/x-data-grid';
import Checkbox from '@mui/material/Checkbox';

interface CustomCheckboxEditProps extends GridRenderEditCellParams {}

export const CustomCheckboxEdit: React.FC<CustomCheckboxEditProps> = (props) => {
  const { id, value, field } = props;
  const apiRef = useGridApiContext();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    apiRef.current.setEditCellValue({ id, field, value: event.target.checked }, event);
    apiRef.current.stopCellEditMode({ id, field });
  };

  return <Checkbox checked={!!value} onChange={handleChange} color="primary" />;
};
