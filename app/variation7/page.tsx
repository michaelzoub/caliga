import type { Metadata } from "next";
import Variation7Client from "./Variation7Client";

export const metadata: Metadata = {
  title: "Caliga — Research on frontier technology",
  description:
    "A research-led collective covering crypto, fintech, deep tech, and frontier AI.",
  robots: { index: false, follow: true },
};

export default function Variation7Page() {
  return <Variation7Client />;
}
