"use client";

import { Suspense } from "react";
import GetStartedComponent from "./GetStartedComponent";

export default function Page() {
  return (
    <Suspense fallback={<p style={{ textAlign: "center", paddingTop: "50px" }}>Loading...</p>}>
      <GetStartedComponent />
    </Suspense>
  );
}