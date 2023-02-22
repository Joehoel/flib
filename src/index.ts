import invariant from "./lib/invariant";
import {
  Awaitable,
  ReceivedEvents,
  EventObjectSignature,
  Options,
  PluginData,
  EmittedEvents,
  RPCResponse,
  FlowEvent,
} from "./types";

export class Flow<Events extends EventObjectSignature, Settings = Record<string, unknown>> {
  // We pass `never` here because we cant possibly know what it is at compile time
  private readonly data: PluginData<EmittedEvents<Events>, Settings>;
  private events = {} as Record<keyof EmittedEvents<Events>, () => void>;
  public icon?: string;

  // @ts-ignore
  private methods: Record<keyof EmittedEvents<Events>, FlowEvent> = {
    "change-query": "Flow.Launcher.ChangeQuery",
    "shell-run": "Flow.Launcher.ShellRun",
    "copy-to-clipboard": "Flow.Launcher.CopyToClipboard",
    "restart-app": "Flow.Launcher.RestartApp",
    "save-settings": "Flow.Launcher.SaveAppAllSettings",
    "check-update": "Flow.Launcher.CheckForNewUpdate",
    "close-app": "Flow.Launcher.CloseApp",
    "hide-app": "Flow.Launcher.HideApp",
    "show-app": "Flow.Launcher.ShowApp",
    "open-settings": "Flow.Launcher.OpenSettings",
    "start-loading": "Flow.Launcher.StartLoadingBar",
    "stop-loading": "Flow.Launcher.StopLoadingBar",
    "get-plugins": "Flow.Launcher.GetPlugins",
    "reload-plugins": "Flow.Launcher.ReloadPlugins",
  };

  constructor({ args, icon }: Options) {
    this.icon = icon;

    this.data = JSON.parse(args);
  }

  public on<K extends keyof ReceivedEvents<Events>>(
    event: K,
    listener: (parameters: ReceivedEvents<Events>[K]) => Awaitable<void>
  ): this {
    invariant(this.data?.parameters, "Parameters not defined");

    this.events[event] = listener.bind(
      this,
      this.data.parameters as unknown as ReceivedEvents<Events>[K]
    );

    return this;
  }

  public emit<K extends keyof EmittedEvents<Events>>(
    event: K,
    parameters?: EmittedEvents<Events>[K]
  ): this {
    const method = this.methods[event];

    console.log(
      JSON.stringify({
        method,
        parameters: parameters || [],
      })
    );

    return this;
  }

  public show<E extends keyof EmittedEvents<Events>>(
    ...results: RPCResponse<EmittedEvents<Events>, E>[]
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

    return this;
  }

  public run() {
    invariant(this.data?.method, "No event defined");
    invariant(this.events, "Events not initialized correctly");

    let method = this.data.method;

    if (this.data.method === "context_menu") {
      method = "context-menu";
    }

    invariant(this.events[method], "Event not found");

    method in this.events && this.events[method]();
  }
}

// const plugin = new Flow({
//   args: JSON.stringify({ method: "query", parameters: ["npm hello world"] }),
// });

// plugin.on("query", ([query]) => {
//   plugin.show({
//     event: "change-query",
//     parameters: ["hello world", true],
//     title: "hello world",
//   });
// });

// plugin.on("hello", ([num]) => {
//   console.log("Number", num);
// });

// plugin.emit("check-update");

// plugin.run();
