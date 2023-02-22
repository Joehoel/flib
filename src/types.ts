export type Prettify<T> = { [K in keyof T]: T[K] } & {};

export type OptionalKey = string & {};

export type EventObjectSignature = Record<OptionalKey, PluginParameters>;

export type ReceivedEvents<CustomEvents extends EventObjectSignature = {}> = {
  query: [query: string];
  "context-menu": [value: number];
  [key: OptionalKey]: PluginParameters;
} & CustomEvents;

export type EmittedEvents<CustomEvents extends EventObjectSignature = {}> = {
  "change-query": [query: string, requery: boolean];
  "shell-run": [command: string];
  "copy-to-clipboard": [value: string];
  "restart-app": never;
  "save-settings": never;
  "check-update": never;
  "close-app": never;
  "hide-app": never;
  "show-app": never;
  "open-settings": never;
  "start-loading": never;
  "stop-loading": never;
  "get-plugins": never;
  "reload-plugins": never;
} & CustomEvents;

export type Awaitable<T> = T | PromiseLike<T>;

export type PluginParameters = Array<string | number | boolean>;

export type RPCResponse<Events, Event extends keyof Events> = {
  title: string;
  subtitle?: string;
  event?: Event;
  parameters?: Events[Event];
  context?: PluginParameters;
  dontHideAfterAction?: boolean;
  score?: number;
  icon?: string;
};

export type PluginData<Events, Settings> = {
  method: keyof Events;
  parameters: Events[keyof Events];
  settings: Settings;
};

export type Options = {
  args: string;
  icon?: string;
};

export type FlowEvent =
  | "Flow.Launcher.ChangeQuery" // change flow launcher query
  | "Flow.Launcher.RestartApp" // restart Flow Launcher
  | "Flow.Launcher.SaveAppAllSettings" // save all Flow Launcher settings
  | "Flow.Launcher.CheckForNewUpdate" // check for new Flow Launcher update
  | "Flow.Launcher.ShellRun" // run shell commands
  | "Flow.Launcher.CloseApp" // close flow launcher
  | "Flow.Launcher.HideApp" // hide flow launcher
  | "Flow.Launcher.ShowApp" // show flow launcher
  | "Flow.Launcher.ShowMsg" // show messagebox
  | "Flow.Launcher.GetTranslation" // get translation of current language
  | "Flow.Launcher.OpenSettingDialog" // open setting dialog
  | "Flow.Launcher.GetAllPlugins" // get all loaded plugins
  | "Flow.Launcher.StartLoadingBar" // start loading animation in flow launcher
  | "Flow.Launcher.StopLoadingBar" // stop loading animation in flow launcher
  | "Flow.Launcher.ReloadAllPluginData"; // reload all flow launcher plugins
