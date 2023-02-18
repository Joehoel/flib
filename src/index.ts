import invariant from "./lib/invariant";

type Prettify<T> = { [K in keyof T]: T[K] } & {};

const methods: Partial<Record<keyof PluginEvents<{}>, `Flow.Launcher.${string}`>> = {
  "change-query": "Flow.Launcher.ChangeQuery",
  "check-update": "Flow.Launcher.CheckForNewUpdate",
  "close-app": "Flow.Launcher.CloseApp",
  "copy-to-clipboard": "Flow.Launcher.CopyToClipboard",
  "hide-app": "Flow.Launcher.HideApp",
  "open-settings": "Flow.Launcher.OpenSettingsDialog",
  "save-settings": "Flow.Launcher.SaveSettings",
  "get-plugins": "Flow.Launcher.GetAllPlugins",
  "reload-plugins": "Flow.Launcher.ReloadAllPlugins",
  "restart-app": "Flow.Launcher.RestartApp",
  "shell-run": "Flow.Launcher.ShellRun",
  "show-app": "Flow.Launcher.ShowApp",
  "start-loading": "Flow.Launcher.StartLoadingBar",
  "stop-loading": "Flow.Launcher.StopLoadingBar",
};

type EmittedEvents<CustomEvents extends Record<string, PluginParameters>> = {
  query: [query: string];
  "context-menu": [value: number];
} & CustomEvents;

type PluginEvents<CustomEvents extends Record<string, PluginParameters>> = {
  "change-query": [query: string, requery: boolean];
  "context-menu": unknown[];
  "restart-app": never[];
  "save-settings": never[];
  "check-update": never[];
  "shell-run": [command: string];
  "close-app": never[];
  "hide-app": never[];
  "show-app": never[];
  "open-settings": never[];
  "start-loading": never[];
  "stop-loading": never[];
  "get-plugins": never[];
  "reload-plugins": never[];
  "copy-to-clipboard": [value: string];
} & EmittedEvents<CustomEvents>;

type Awaitable<T> = T | PromiseLike<T>;

type PluginParameters = Array<string | number | boolean | Record<string, unknown>>;

type RPCResponse<Events, Event extends keyof Events> = {
  title: string;
  subtitle?: string;
  event?: Event;
  parameters?: Events[Event];
  context?: PluginParameters;
  dontHideAfterAction?: boolean;
  score?: number;
  icon?: string;
};

type PluginData<Events, Settings> = {
  method: keyof Events;
  parameters: Events[keyof Events];
  settings: Settings;
};

type Options = {
  args: string;
  icon?: string;
};

export class Flow<
  Events extends Record<string, PluginParameters>,
  Settings = Record<string, unknown>
> {
  // We pass `never` here because we cant possibly know what it is at compile time
  private readonly data: PluginData<PluginEvents<Events>, Settings>;
  private events = {} as Record<keyof PluginEvents<Events>, () => void>;
  public icon?: string;

  constructor({ args, icon }: Options) {
    this.icon = icon;
    this.data = JSON.parse(args);
  }

  public on<K extends keyof EmittedEvents<Events>>(
    event: K,
    listener: (parameters: EmittedEvents<Events>[K]) => Awaitable<void>
  ): this {
    invariant(this.data?.parameters, "Parameters not defined");

    this.events[event] = listener.bind(
      this,
      this.data.parameters as unknown as EmittedEvents<Events>[K]
    );

    return this;
  }

  public emit<K extends keyof PluginEvents<Events>>(
    event: K,
    parameters: PluginEvents<Events>[K]
  ): this {
    const params = Object.values(parameters);

    console.log(
      JSON.stringify({
        method: event,
        parameters: params,
      })
    );

    return this;
  }

  public show<E extends keyof PluginEvents<Events>>(
    ...results: RPCResponse<PluginEvents<Events>, E>[]
  ) {
    const result = results.map(
      ({ title, context, dontHideAfterAction, event, icon, parameters, subtitle, score }) => {
        const params = parameters ? Object.values(parameters) : [];

        return {
          Title: title,
          Subtitle: subtitle,
          Method: event,
          JsonRPCAction: {
            method: event,
            parameters: params,
            dontHideAfterAction: dontHideAfterAction || false,
          },
          ContextData: context || [],
          IcoPath: icon || this.icon,
          Score: score || 0,
        };
      }
    );

    console.log(JSON.stringify({ result }));
  }

  public run() {
    invariant(this.data?.method, "No event defined");
    invariant(this.events, "Events not initialized correctly");

    let method = this.data.method;

    if (this.data.method === "context_menu") {
      method = "context-menu";
    }

    invariant(this.events[method], "Something went wrong");

    method in this.events && this.events[method]();
  }
}

const plugin = new Flow<{ copy: [value: string]; "context-menu": [value: number] }>({
  args: JSON.stringify({ method: "query", parameters: ["npm hello world"] }),
});

plugin.on("query", ([query]) => {
  console.log("Query", query);
});

plugin.on("context-menu", ([num]) => {
  console.log("Number", num);
});

plugin.run();
