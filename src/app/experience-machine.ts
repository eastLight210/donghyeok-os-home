import { publicApps, type PublicAppId } from "@/src/content/public-apps";

export type ExperienceState =
  | { name: "boot" }
  | { name: "entering" }
  | { name: "desktop"; activeApp: PublicAppId | null; entrance?: boolean }
  | {
      name: "switcher";
      selectedApp: PublicAppId;
      originApp: PublicAppId | null;
    }
  | { name: "opening-app"; selectedApp: PublicAppId };

export type ExperienceEvent =
  | { type: "ENTER" }
  | { type: "ENTERED"; activeApp?: PublicAppId | null }
  | { type: "SKIP_BOOT"; activeApp?: PublicAppId | null }
  | { type: "OPEN_SWITCHER"; selectedApp?: PublicAppId }
  | { type: "SELECT_APP"; appId: PublicAppId }
  | { type: "ROTATE"; direction: -1 | 1 }
  | { type: "OPEN_SELECTED" }
  | { type: "OPEN_APP"; appId: PublicAppId }
  | { type: "APP_OPENED" }
  | { type: "CANCEL_SWITCHER" }
  | { type: "POWER_OFF" }
  | { type: "NAVIGATE"; appId: PublicAppId | null };

const rotate = (current: PublicAppId, direction: -1 | 1): PublicAppId => {
  const index = publicApps.findIndex((app) => app.id === current);
  const nextIndex = (index + direction + publicApps.length) % publicApps.length;
  return publicApps[nextIndex].id;
};

export const initialExperienceState: ExperienceState = { name: "boot" };

export function experienceReducer(
  state: ExperienceState,
  event: ExperienceEvent,
): ExperienceState {
  switch (event.type) {
    case "ENTER":
      return state.name === "boot" ? { name: "entering" } : state;
    case "ENTERED":
      return {
        name: "desktop",
        activeApp: event.activeApp ?? null,
        entrance: true,
      };
    case "SKIP_BOOT":
      return { name: "desktop", activeApp: event.activeApp ?? null };
    case "OPEN_SWITCHER":
      if (state.name !== "desktop") return state;
      return {
        name: "switcher",
        selectedApp: event.selectedApp ?? state.activeApp ?? "projects",
        originApp: state.activeApp,
      };
    case "SELECT_APP":
      return state.name === "switcher"
        ? { ...state, selectedApp: event.appId }
        : state;
    case "ROTATE":
      return state.name === "switcher"
        ? { ...state, selectedApp: rotate(state.selectedApp, event.direction) }
        : state;
    case "OPEN_SELECTED":
      return state.name === "switcher"
        ? { name: "opening-app", selectedApp: state.selectedApp }
        : state;
    case "OPEN_APP":
      return state.name === "desktop"
        ? { name: "opening-app", selectedApp: event.appId }
        : state;
    case "APP_OPENED":
      return state.name === "opening-app"
        ? { name: "desktop", activeApp: state.selectedApp }
        : state;
    case "CANCEL_SWITCHER":
      return state.name === "switcher"
        ? { name: "desktop", activeApp: state.originApp }
        : state;
    case "NAVIGATE":
      return { name: "desktop", activeApp: event.appId };
    case "POWER_OFF":
      return { name: "boot" };
    default:
      return state;
  }
}
