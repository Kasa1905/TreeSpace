import { createRoot } from "react-dom/client";
import { FoundationPage } from "../components/common/FoundationPage";

createRoot(document.getElementById("root")!).render(
  <FoundationPage surface="options">
    <p>TreeSpace settings will be added in a later phase.</p>
    <p className="foundation-page__status">No settings configured</p>
  </FoundationPage>
);
