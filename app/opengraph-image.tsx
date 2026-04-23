import { ImageResponse } from "next/og";

export const alt = "Chron — cron, in plain English";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#F6F2EA",
          color: "#1E1B18",
          padding: "64px 72px",
          fontFamily:
            "ui-serif, Georgia, 'Times New Roman', Times, serif",
        }}
      >
        {/* Top-left brand */}
        <div
          style={{
            display: "flex",
            fontFamily: "ui-monospace, Menlo, monospace",
            fontSize: 20,
            fontWeight: 500,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#1E1B18",
          }}
        >
          CHRON
        </div>

        {/* Center: cron + humanized sentence */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 40,
            marginTop: -24,
          }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: "ui-monospace, Menlo, monospace",
              fontSize: 136,
              fontWeight: 500,
              letterSpacing: "-0.02em",
              color: "#1E1B18",
              lineHeight: 1,
            }}
          >
            */15 9-17 * * 1-5
          </div>
          <div
            style={{
              display: "flex",
              textAlign: "center",
              maxWidth: 1000,
              fontSize: 46,
              lineHeight: 1.25,
              fontStyle: "italic",
              color: "#1E1B18",
              letterSpacing: "-0.015em",
            }}
          >
            <span style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
              Every&nbsp;
              <span style={{ color: "#B85C38" }}>15 minutes</span>
              &nbsp;during&nbsp;
              <span style={{ color: "#B85C38" }}>business hours</span>
              &nbsp;(9&nbsp;AM–5&nbsp;PM),&nbsp;
              <span style={{ color: "#B85C38" }}>weekdays</span>
              &nbsp;only.
            </span>
          </div>
        </div>

        {/* Bottom-right micro label */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            fontFamily: "ui-monospace, Menlo, monospace",
            fontSize: 16,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#5A544E",
          }}
        >
          cron, in plain english
        </div>
      </div>
    ),
    { ...size },
  );
}
