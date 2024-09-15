import { useMemo } from 'react';

const useZoomAdjustment = (zoom: number) => {
  const fontSize = useMemo(() => {
    if (zoom >= 1) return 16;
    if (zoom >= 0.5) return 14;
    if (zoom >= 0.25) return 12;
    if (zoom >= 0.1) return 10;
    return 8;
  }, [zoom]);

  return { fontSize };
};

export default useZoomAdjustment;