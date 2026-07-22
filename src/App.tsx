import { Toaster } from 'react-hot-toast'; // SỬA GẮT: Nhớ import cái này
import { AppRoutes } from './routes/AppRoutes';

function App() {
  return (
    <>
      <AppRoutes /> 
      <Toaster position="top-right" />
    </>
  );
}

export default App;