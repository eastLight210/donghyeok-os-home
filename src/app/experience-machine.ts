import { publicApps, type PublicAppId } from "@/src/content/public-apps";

export type ExperienceState =
  | { name: "home"; selection: number }
  | { name: "content"; selection: number; appId: PublicAppId };
export type ExperienceEvent =
  | { type: "ROTATE"; direction: -1 | 1 }
  | { type: "OPEN_APP"; appId: PublicAppId }
  | { type: "NAVIGATE"; appId: PublicAppId | null }
  | { type: "CLOSE" };
export const initialExperienceState: ExperienceState = { name: "home", selection: 1 };
export const selectedApp = (selection: number) => publicApps[((selection % publicApps.length) + publicApps.length) % publicApps.length];
export function experienceReducer(state: ExperienceState, event: ExperienceEvent): ExperienceState {
  switch (event.type) {
    case "ROTATE": return state.name === "home" ? { ...state, selection: state.selection + event.direction } : state;
    case "OPEN_APP": return { name: "content", selection: state.selection, appId: event.appId };
    case "NAVIGATE": return event.appId ? { name: "content", selection: state.selection, appId: event.appId } : { name: "home", selection: state.selection };
    case "CLOSE": return { name: "home", selection: state.selection };
  }
}
