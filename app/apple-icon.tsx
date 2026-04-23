import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1A1310",
          color: "#D8B864",
          fontFamily: "ui-monospace, Menlo, monospace",
          fontSize: 76,
          fontWeight: 600,
          letterSpacing: "-0.03em",
        }}
      >
        */5
      </div>
    ),
    { ...size },
  );
}
