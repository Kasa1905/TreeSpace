import { createRoot } from "react-dom/client";
import { FoundationPage } from "../components/common/FoundationPage";

createRoot(document.getElementById("root")!).render(
  <FoundationPage surface="popup">
    <p>The extension foundation is ready for the next implementation phase.</p>
    <p className="foundation-page__status">Phase 1 foundation</p>
  </FoundationPage>
);
