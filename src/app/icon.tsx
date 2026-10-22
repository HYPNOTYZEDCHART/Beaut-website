import { ImageResponse } from 'next/og';

export const size = {
  width: 64,
  height: 64,
};

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FDF8F9',
          borderRadius: '18px',
          border: '2px solid #D88B99',
          color: '#C47482',
          fontSize: 28,
          fontWeight: 700,
          fontFamily: 'serif',
        }}
      >
        TEB
      </div>
    ),
    {
      ...size,
    }
  );
}

