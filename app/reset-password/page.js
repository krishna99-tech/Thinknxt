"use client";

import { Suspense } from "react";
import ResetPasswordComponent from "./ResetPasswordComponent";

export default function Page() {
  return (
    <Suspense fallback={<p style={{ textAlign: "center", paddingTop: "50px" }}>Loading...</p>}>
      <ResetPasswordComponent />
    </Suspense>
  );
}
