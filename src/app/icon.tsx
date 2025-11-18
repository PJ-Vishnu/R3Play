import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: "#222222",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#39FF14",
          textShadow: "0 0 4px #39FF14, 0 0 8px #39FF14",
          fontFamily: '"Space Grotesk", sans-serif',
          fontWeight: 700,
          borderRadius: 4,
        }}
      >
        R
      </div>
    ),
    {
      ...size,
    }
  );
}
