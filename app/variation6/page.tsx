import type { Metadata } from "next";
import Variation6Client from "./Variation6Client";

export const metadata: Metadata = {
  title: "Caliga — Research on frontier technology",
  description:
    "A two-person research collective covering crypto, fintech, deep tech, and frontier AI.",
  robots: { index: false, follow: true },
};

export default function Variation6Page() {
  return <Variation6Client />;
}
