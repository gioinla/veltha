import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import PromptOrganism from "./PromptOrganism";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <PromptOrganism />
  </StrictMode>
);
